"""
Re-interview request – HR/Interviewer request, Admin approve/reject.
MongoDB collection: re_interview_requests.
"""
from datetime import datetime
from typing import Any

from bson import ObjectId


def re_interview_request_doc(
    candidate_oid: ObjectId,
    candidate_id: str,
    requested_by_oid: ObjectId,
    reason: str,
) -> dict[str, Any]:
    now = datetime.utcnow()
    return {
        "candidate_id": candidate_id,
        "candidate_oid": candidate_oid,
        "requested_by_id": requested_by_oid,
        "reason": reason,
        "status": "pending",
        "approved_by_id": None,
        "resolved_at": None,
        "created_at": now,
        "updated_at": None,
    }
