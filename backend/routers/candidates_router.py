"""
Candidates API: search by ID / QR, get profile, list (filters).
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from pymongo.database import Database

from database import get_db, CANDIDATES
from auth.jwt import require_auth, require_roles
from models.user import UserView
from models.candidate import candidate_doc, doc_to_candidate_profile

router = APIRouter(prefix="/api/candidates", tags=["candidates"])


class CandidateProfile(BaseModel):
    id: Optional[str]
    candidate_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    qualifications: Optional[str] = None
    experience_years: Optional[float] = None
    role_applied: Optional[str] = None
    status: str
    eligibility: Optional[str] = None
    qr_code_path: Optional[str] = None
    ms_form_response_id: Optional[str] = None
    created_at: Optional[str] = None


@router.get("/search", response_model=dict)
def search(
    q: Optional[str] = Query(None, description="Candidate ID or search term"),
    db: Database = Depends(get_db),
    user: UserView = Depends(require_auth),
):
    """Search by Candidate ID or partial match on name/email."""
    if not q or not q.strip():
        return {"candidates": [], "total": 0}
    term = q.strip()
    if term.upper().startswith("TPEML-"):
        c = db[CANDIDATES].find_one({"candidate_id": term})
        if c:
            return {"candidates": [doc_to_candidate_profile(c)], "total": 1}
        return {"candidates": [], "total": 0}
    rgx = {"$regex": term, "$options": "i"}
    candidates = list(db[CANDIDATES].find({
        "$or": [
            {"name": rgx},
            {"email": rgx},
            {"candidate_id": rgx},
        ]
    }).limit(50))
    return {"candidates": [doc_to_candidate_profile(c) for c in candidates], "total": len(candidates)}


@router.get("/id/{candidate_id}", response_model=CandidateProfile)
def get_by_id(
    candidate_id: str,
    db: Database = Depends(get_db),
    user: UserView = Depends(require_auth),
):
    """Get candidate profile by Candidate ID."""
    try:
        c = db[CANDIDATES].find_one({"candidate_id": candidate_id})
        if not c:
            raise HTTPException(status_code=404, detail="Candidate not found")
        return CandidateProfile(**doc_to_candidate_profile(c))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting candidate {candidate_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to get candidate: {str(e)}")


class CreateCandidateRequest(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    qualifications: Optional[str] = None
    experience_years: Optional[float] = None
    role_applied: Optional[str] = None


@router.post("", response_model=CandidateProfile, status_code=201)
def create_candidate(
    req: CreateCandidateRequest,
    db: Database = Depends(get_db),
    user: UserView = Depends(require_roles(["admin", "hr"])),
):
    """Manual candidate creation. Generates Candidate ID and QR."""
    try:
        from utils.candidate_id import generate_candidate_id
        from services.qr_service import generate_qr_for_candidate
        from services.eligibility_service import evaluate_eligibility

        candidate_id = generate_candidate_id(db, req.role_applied)
        doc = candidate_doc(
            candidate_id=candidate_id,
            name=req.name,
            email=req.email,
            phone=req.phone,
            qualifications=req.qualifications,
            experience_years=req.experience_years,
            role_applied=req.role_applied,
            status="yet_to_interview",
            eligibility="partial",
        )
        r = db[CANDIDATES].insert_one(doc)
        doc["_id"] = r.inserted_id
        try:
            generate_qr_for_candidate(db, doc, base_url="")
        except Exception as e:
            print(f"Warning: QR generation failed: {e}")
        try:
            evaluate_eligibility(db, doc)
        except Exception as e:
            print(f"Warning: Eligibility evaluation failed: {e}")
        return CandidateProfile(**doc_to_candidate_profile(doc))
    except Exception as e:
        print(f"Error creating candidate: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create candidate: {str(e)}")


@router.get("", response_model=dict)
def list_candidates(
    status_filter: Optional[str] = Query(None, alias="status"),
    role: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Database = Depends(get_db),
    user: UserView = Depends(require_auth),
):
    """List candidates with optional filters."""
    q = {}
    if status_filter:
        q["status"] = status_filter
    if role:
        q["role_applied"] = {"$regex": role, "$options": "i"}
    total = db[CANDIDATES].count_documents(q)
    cursor = db[CANDIDATES].find(q).sort("created_at", -1).skip(skip).limit(limit)
    candidates = [doc_to_candidate_profile(c) for c in cursor]
    return {"candidates": candidates, "total": total}
