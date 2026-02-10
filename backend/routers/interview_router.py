"""
Interview workflow: Yet-To-Interview (submit notes/decision), Interview Completed (read-only).
"""
from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from pymongo.database import Database

from database import get_db, CANDIDATES, INTERVIEWS, USERS
from auth.jwt import require_auth, require_roles
from models.user import UserView
from models.candidate import doc_to_candidate_profile
from models.interview import interview_doc, doc_to_interview_result
from routers.audit import log_action

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


class SubmitInterviewRequest(BaseModel):
    candidate_id: str
    notes: Optional[str] = None
    decision: str  # shortlist | reject | hold


class InterviewResult(BaseModel):
    id: str
    candidate_id: str
    candidate_name: str
    role_applied: Optional[str] = None
    interviewer_name: str
    interview_date: Optional[str]
    decision: str
    notes: Optional[str]
    created_at: Optional[str]


@router.get("/yet-to-interview", response_model=dict)
def list_yet_to_interview(
    role_filter: Optional[str] = Query(None, alias="role"),
    db: Database = Depends(get_db),
    user: UserView = Depends(require_auth),
):
    """List candidates with status yet_to_interview."""
    q = {"status": "yet_to_interview"}
    if role_filter:
        q["role_applied"] = {"$regex": role_filter, "$options": "i"}
    candidates = list(db[CANDIDATES].find(q).sort("created_at", -1))
    items = []
    for c in candidates:
        items.append({
            "id": str(c["_id"]),
            "candidate_id": c.get("candidate_id"),
            "name": c.get("name"),
            "role_applied": c.get("role_applied"),
            "experience_years": c.get("experience_years"),
            "qualifications": (c.get("qualifications") or "")[:200],
        })
    return {"candidates": items, "total": len(items)}


@router.post("/submit")
def submit_interview(
    req: SubmitInterviewRequest,
    db: Database = Depends(get_db),
    user: UserView = Depends(require_roles(["admin", "hr", "interviewer"])),
):
    """Add interview notes + decision. Moves candidate to interview_completed."""
    c = db[CANDIDATES].find_one({"candidate_id": req.candidate_id})
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    if c.get("status") != "yet_to_interview":
        raise HTTPException(status_code=400, detail="Candidate already interviewed")
    if req.decision not in ("shortlist", "reject", "hold"):
        raise HTTPException(status_code=400, detail="Invalid decision")

    cand_oid = c["_id"]
    doc = interview_doc(
        candidate_oid=cand_oid,
        candidate_id=req.candidate_id,
        interviewer_oid=user.oid,
        decision=req.decision,
        notes=req.notes,
    )
    r = db[INTERVIEWS].insert_one(doc)
    db[CANDIDATES].update_one(
    {"_id": cand_oid},
    {
        "$set": {
            "status": "interview_completed",
            "decision": req.decision,
            "interview_notes": req.notes,
            "updated_at": datetime.utcnow(),
        }
    },
)

    log_action(db, user.oid, "interview_submit", "interview", str(r.inserted_id), {"candidate_id": req.candidate_id, "decision": req.decision})
    return {"id": str(r.inserted_id), "candidate_id": req.candidate_id, "decision": req.decision, "status": "interview_completed"}


@router.get("/completed", response_model=dict)
def list_completed(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    decision: Optional[str] = Query(None),
    db: Database = Depends(get_db),
    user: UserView = Depends(require_auth),
):
    """Read-only list of completed interviews."""
    cand_q: dict = {"status": "interview_completed"}
    if role:
        cand_q["role_applied"] = {"$regex": role, "$options": "i"}
    completed_ids = [d["_id"] for d in db[CANDIDATES].find(cand_q, {"_id": 1})]
    q: dict = {"candidate_oid": {"$in": completed_ids}}
    date_q: dict = {}
    if from_date:
        date_q["$gte"] = datetime.fromisoformat(from_date.replace("Z", "+00:00"))
    if to_date:
        date_q["$lte"] = datetime.fromisoformat(to_date.replace("Z", "+00:00"))
    if date_q:
        q["interview_date"] = date_q
    if decision:
        q["decision"] = decision
    interviews = list(db[INTERVIEWS].find(q).sort("interview_date", -1))
    out = []
    for i in interviews:
        cand = db[CANDIDATES].find_one({"_id": i["candidate_oid"]}) or {}
        u = db[USERS].find_one({"_id": i["interviewer_id"]}) or {}
        out.append(doc_to_interview_result(
            i,
            candidate_name=cand.get("name", ""),
            interviewer_name=u.get("full_name", ""),
            role_applied=cand.get("role_applied"),
        ))
    return {"interviews": out, "total": len(out)}


@router.get("/completed/{interview_id}", response_model=InterviewResult)
def get_completed(
    interview_id: str,
    db: Database = Depends(get_db),
    user: UserView = Depends(require_auth),
):
    """Read-only single completed interview."""
    try:
        oid = ObjectId(interview_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Interview not found")
    i = db[INTERVIEWS].find_one({"_id": oid})
    if not i:
        raise HTTPException(status_code=404, detail="Interview not found")
    cand = db[CANDIDATES].find_one({"_id": i["candidate_oid"]})
    if not cand or cand.get("status") != "interview_completed":
        raise HTTPException(status_code=404, detail="Interview not found")
    u = db[USERS].find_one({"_id": i["interviewer_id"]})
    res = doc_to_interview_result(
        i,
        candidate_name=cand.get("name", ""),
        interviewer_name=u.get("full_name") if u else "",
        role_applied=cand.get("role_applied"),
    )
    return InterviewResult(**res)
