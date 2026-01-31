"""
MS Forms sync – ingest responses from Microsoft Forms.
MS Forms remains source of truth; we store response ID and create/update candidates.
Configure MS_FORMS_* in .env for production.
"""
import logging
from typing import Any, Optional
from datetime import datetime

import httpx
from pymongo.database import Database

from config import get_settings
from database import CANDIDATES
from utils.candidate_id import generate_candidate_id
from services.qr_service import generate_qr_for_candidate
from services.eligibility_service import evaluate_eligibility
from models.candidate import candidate_doc

logger = logging.getLogger(__name__)
settings = get_settings()


def _ms_form_oauth_token() -> Optional[str]:
    """Obtain OAuth2 token for Microsoft Graph (Forms). Stub: returns None if not configured."""
    if not all([settings.MS_FORMS_TENANT_ID, settings.MS_FORMS_CLIENT_ID, settings.MS_FORMS_CLIENT_SECRET]):
        return None
    url = f"https://login.microsoftonline.com/{settings.MS_FORMS_TENANT_ID}/oauth2/v2.0/token"
    data = {
        "client_id": settings.MS_FORMS_CLIENT_ID,
        "client_secret": settings.MS_FORMS_CLIENT_SECRET,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials",
    }
    try:
        with httpx.Client() as client:
            r = client.post(url, data=data)
            r.raise_for_status()
            return r.json().get("access_token")
    except Exception as e:
        logger.warning("MS Forms OAuth failed: %s", e)
        return None


def _fetch_form_responses(form_id: str, token: str) -> list[dict]:
    """Fetch form responses from Microsoft Graph. Returns list of response objects."""
    url = f"https://graph.microsoft.com/v1.0/forms/{form_id}/responses"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        with httpx.Client() as client:
            r = client.get(url, headers=headers)
            r.raise_for_status()
            data = r.json()
            return data.get("value", [])
    except Exception as e:
        logger.warning("MS Forms fetch responses failed: %s", e)
        return []


def _map_response_to_candidate(response: dict) -> dict[str, Any]:
    """Map MS Forms response to candidate fields. Adapt keys to your actual form question IDs."""
    answers = response.get("answers", {}) or {}

    def _val(qid: str) -> str:
        a = answers.get(qid)
        if not a:
            return ""
        if isinstance(a, dict) and "value" in a:
            v = a["value"]
            return v if isinstance(v, str) else (v.get("displayName") or str(v))
        return str(a)

    return {
        "ms_form_response_id": response.get("id"),
        "name": _val("name") or _val("question1") or "Unknown",
        "email": _val("email") or _val("question2") or "",
        "phone": _val("phone") or _val("question3") or "",
        "qualifications": _val("qualifications") or _val("question4") or "",
        "experience_years": _parse_float(_val("experience") or _val("question5")),
        "role_applied": _val("role") or _val("question6") or "",
    }


def _parse_float(s: str) -> Optional[float]:
    try:
        return float(s.strip().replace(",", "."))
    except (ValueError, AttributeError):
        return None


def sync_form_responses(db: Database, base_url: str = "") -> tuple[int, int]:
    """Fetch MS Forms responses, create new candidates, generate IDs and QR."""
    if not settings.MS_FORMS_FORM_ID:
        logger.info("MS_FORMS_FORM_ID not set; skipping sync.")
        return 0, 0

    token = _ms_form_oauth_token()
    if not token:
        logger.warning("Could not obtain MS Forms token; skipping sync.")
        return 0, 0

    responses = _fetch_form_responses(settings.MS_FORMS_FORM_ID, token)
    created, updated = 0, 0

    for r in responses:
        rid = r.get("id")
        existing = db[CANDIDATES].find_one({"ms_form_response_id": rid}) if rid else None
        data = _map_response_to_candidate(r)

        if existing:
            update: dict = {}
            if data.get("name"):
                update["name"] = data["name"]
            if data.get("email") is not None:
                update["email"] = data["email"]
            if data.get("phone") is not None:
                update["phone"] = data["phone"]
            if data.get("qualifications") is not None:
                update["qualifications"] = data["qualifications"]
            if data.get("experience_years") is not None:
                update["experience_years"] = data["experience_years"]
            if data.get("role_applied") is not None:
                update["role_applied"] = data["role_applied"]
            if update:
                update["updated_at"] = datetime.utcnow()
                db[CANDIDATES].update_one({"_id": existing["_id"]}, {"$set": update})
            updated += 1
            continue

        candidate_id = generate_candidate_id(db, data.get("role_applied"))
        doc = candidate_doc(
            candidate_id=candidate_id,
            ms_form_response_id=rid,
            name=data["name"],
            email=data.get("email"),
            phone=data.get("phone"),
            qualifications=data.get("qualifications"),
            experience_years=data.get("experience_years"),
            role_applied=data.get("role_applied"),
            status="yet_to_interview",
            eligibility="partial",
        )
        r = db[CANDIDATES].insert_one(doc)
        doc["_id"] = r.inserted_id
        generate_qr_for_candidate(db, doc, base_url)
        evaluate_eligibility(db, doc)
        created += 1

    return created, updated
