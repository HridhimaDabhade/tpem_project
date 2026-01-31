"""
Interview document – one record per interview session.
MongoDB collection: interviews.
Decision: shortlist | reject | hold.
"""
from datetime import datetime
from typing import Any

from bson import ObjectId


def interview_doc(
    candidate_oid: ObjectId,
    candidate_id: str,
    interviewer_oid: ObjectId,
    decision: str,
    *,
    notes: str | None = None,
) -> dict[str, Any]:
    now = datetime.utcnow()
    return {
        "candidate_id": candidate_id,
        "candidate_oid": candidate_oid,
        "interviewer_id": interviewer_oid,
        "interview_date": now,
        "notes": notes,
        "decision": decision,
        "created_at": now,
        "updated_at": None,
    }


def doc_to_interview_result(d: dict, candidate_name: str, interviewer_name: str, role_applied: str | None) -> dict[str, Any]:
    oid = d.get("_id")
    idt = d.get("interview_date")
    ca = d.get("created_at")
    return {
        "id": str(oid) if oid else None,
        "candidate_id": d.get("candidate_id"),
        "candidate_name": candidate_name,
        "role_applied": role_applied,
        "interviewer_name": interviewer_name,
        "interview_date": idt.isoformat() if idt else None,
        "decision": d.get("decision"),
        "notes": d.get("notes"),
        "created_at": ca.isoformat() if ca else None,
    }
