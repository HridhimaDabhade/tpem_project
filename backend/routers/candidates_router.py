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
from models.candidate import candidate_doc, doc_to_candidate_profile, CandidateProfile

router = APIRouter(prefix="/api/candidates", tags=["candidates"])


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
    # Basic info
    name: str
    gender: str
    dob: str  # Date of birth
    contact_no: str
    email: str
    residential_address: str
    state_of_domicile: str
    
    # Interview details
    interview_location: str
    date_of_interview: str
    year_of_recruitment: str
    
    # Education - Diploma
    college_name: str
    university_name: str
    diploma_enrollment_no: str
    diploma_branch: str
    diploma_passout_year: str
    diploma_percentage: float
    any_backlog_in_diploma: str
    
    # Education - 10th & 12th
    tenth_percentage: float
    tenth_passout_year: str
    twelfth_percentage: Optional[float] = None  # Optional
    twelfth_passout_year: Optional[str] = None  # Optional
    
    # Onboarding metadata (will be set by backend)
    onboarding_type: str = "by_user"  # Default for protected route


@router.post("", response_model=CandidateProfile, status_code=201)
def create_candidate(
    req: CreateCandidateRequest,
    db: Database = Depends(get_db),
    user: UserView = Depends(require_roles(["admin", "hr"])),
):
    """Create candidate by company user. Generates Candidate ID and QR."""
    try:
        from utils.candidate_id import generate_candidate_id

        # Generate candidate ID based on diploma branch
        candidate_id = generate_candidate_id(db, req.diploma_branch)
        
        doc = candidate_doc(
            candidate_id=candidate_id,
            name=req.name,
            gender=req.gender,
            dob=req.dob,
            contact_no=req.contact_no,
            email=req.email,
            residential_address=req.residential_address,
            state_of_domicile=req.state_of_domicile,
            interview_location=req.interview_location,
            date_of_interview=req.date_of_interview,
            year_of_recruitment=req.year_of_recruitment,
            college_name=req.college_name,
            university_name=req.university_name,
            diploma_enrollment_no=req.diploma_enrollment_no,
            diploma_branch=req.diploma_branch,
            diploma_passout_year=req.diploma_passout_year,
            diploma_percentage=req.diploma_percentage,
            any_backlog_in_diploma=req.any_backlog_in_diploma,
            tenth_percentage=req.tenth_percentage,
            tenth_passout_year=req.tenth_passout_year,
            twelfth_percentage=req.twelfth_percentage,
            twelfth_passout_year=req.twelfth_passout_year,
            onboarding_type="by_user",
            onboarded_by=user.id,  # Store who created this candidate
            status="yet_to_interview",
        )
        
        r = db[CANDIDATES].insert_one(doc)
        doc["_id"] = r.inserted_id
        
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
