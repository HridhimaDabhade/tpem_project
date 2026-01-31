"""
Re-interview: HR/Interviewer request, Admin approve/reject.
"""
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from pymongo.database import Database

from database import get_db, CANDIDATES, RE_INTERVIEW_REQUESTS, USERS
from auth.jwt import require_auth, require_roles
from models.user import UserView
from models.re_interview_request import re_interview_request_doc
from routers.audit import log_action

router = APIRouter(prefix="/api/re-interview", tags=["re-interview"])


class RequestReInterviewBody(BaseModel):
    candidate_id: str
    reason: str


class ResolveReInterviewBody(BaseModel):
    request_id: str  # MongoDB _id as string
    approved: bool


@router.post("/request")
def request_re_interview(
    body: RequestReInterviewBody,
    db: Database = Depends(get_db),
    user: UserView = Depends(require_roles(["admin", "hr", "interviewer"])),
):
    """HR/Interviewer request re-interview with reason."""
    c = db[CANDIDATES].find_one({"candidate_id": body.candidate_id})
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    if c.get("status") != "interview_completed":
        raise HTTPException(status_code=400, detail="Only completed interviewees can be requested for re-interview")

    doc = re_interview_request_doc(
        candidate_oid=c["_id"],
        candidate_id=body.candidate_id,
        requested_by_oid=user.oid,
        reason=body.reason,
    )
    r = db[RE_INTERVIEW_REQUESTS].insert_one(doc)
    log_action(db, user.oid, "re_interview_request", "re_interview_request", str(r.inserted_id), {"candidate_id": body.candidate_id})
    return {"id": str(r.inserted_id), "candidate_id": body.candidate_id, "status": "pending"}


@router.post("/resolve")
def resolve_re_interview(
    body: ResolveReInterviewBody,
    db: Database = Depends(get_db),
    user: UserView = Depends(require_roles(["admin"])),
):
    """Admin approves or rejects re-interview request."""
    try:
        oid = ObjectId(body.request_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Request not found")
    req = db[RE_INTERVIEW_REQUESTS].find_one({"_id": oid})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Request already resolved")

    status_new = "approved" if body.approved else "rejected"
    db[RE_INTERVIEW_REQUESTS].update_one(
        {"_id": oid},
        {"$set": {
            "status": status_new,
            "approved_by_id": user.oid,
            "resolved_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }},
    )

    if body.approved:
        db[CANDIDATES].update_one(
            {"_id": req["candidate_oid"]},
            {"$set": {"status": "yet_to_interview", "updated_at": datetime.utcnow()}},
        )
        cand = db[CANDIDATES].find_one({"_id": req["candidate_oid"]})
        log_action(db, user.oid, "re_interview_approve", "re_interview_request", str(oid), {"candidate_id": cand.get("candidate_id") if cand else ""})
    else:
        log_action(db, user.oid, "re_interview_reject", "re_interview_request", str(oid), {})

    return {"id": str(oid), "status": status_new}


@router.get("/pending", response_model=dict)
def list_pending(
    db: Database = Depends(get_db),
    user: UserView = Depends(require_roles(["admin"])),
):
    """List pending re-interview requests. Admin only."""
    reqs = list(db[RE_INTERVIEW_REQUESTS].find({"status": "pending"}))
    out = []
    for r in reqs:
        cand = db[CANDIDATES].find_one({"_id": r["candidate_oid"]}) or {}
        u = db[USERS].find_one({"_id": r["requested_by_id"]}) or {}
        ca = r.get("created_at")
        out.append({
            "id": str(r["_id"]),
            "candidate_id": cand.get("candidate_id", ""),
            "candidate_name": cand.get("name", ""),
            "requested_by": u.get("email", ""),
            "reason": r.get("reason", ""),
            "created_at": ca.isoformat() if ca else None,
        })
    return {"requests": out, "total": len(out)}
