"""
Candidate document – profile from MS Forms sync.
MongoDB collection: candidates.
Candidate ID format: TPEML-2026-ENG-00412.
"""
from datetime import datetime
from typing import Any


def candidate_doc(
    candidate_id: str,
    name: str,
    *,
    ms_form_response_id: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    qualifications: str | None = None,
    experience_years: float | None = None,
    role_applied: str | None = None,
    status: str = "yet_to_interview",
    eligibility: str = "partial",
    qr_code_path: str | None = None,
) -> dict[str, Any]:
    now = datetime.utcnow()
    return {
        "candidate_id": candidate_id,
        "ms_form_response_id": ms_form_response_id,
        "name": name,
        "email": email,
        "phone": phone,
        "qualifications": qualifications,
        "experience_years": experience_years,
        "role_applied": role_applied,
        "status": status,
        "eligibility": eligibility,
        "qr_code_path": qr_code_path,
        "created_at": now,
        "updated_at": None,
    }


def doc_to_candidate_profile(d: dict) -> dict[str, Any]:
    """Convert MongoDB candidate doc to API profile."""
    oid = d.get("_id")
    ca = d.get("created_at")
    # Handle created_at - could be datetime or string from JSON
    if ca:
        if isinstance(ca, str):
            created_at = ca
        else:
            created_at = ca.isoformat() if hasattr(ca, 'isoformat') else str(ca)
    else:
        created_at = None
    
    return {
        "id": str(oid) if oid else None,
        "candidate_id": d.get("candidate_id"),
        "name": d.get("name"),
        "email": d.get("email"),
        "phone": d.get("phone"),
        "qualifications": d.get("qualifications"),
        "experience_years": d.get("experience_years"),
        "role_applied": d.get("role_applied"),
        "status": d.get("status"),
        "eligibility": d.get("eligibility"),
        "qr_code_path": d.get("qr_code_path"),
        "ms_form_response_id": d.get("ms_form_response_id"),
        "created_at": created_at,
    }
