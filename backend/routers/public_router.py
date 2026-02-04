"""
Public API: Self-onboarding for candidates (no authentication required).
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from pymongo.database import Database
from typing import Optional

from database import get_db, CANDIDATES
from models.candidate import candidate_doc, doc_to_candidate_profile, CandidateProfile

router = APIRouter(prefix="/api/public", tags=["public"])


class SelfOnboardingRequest(BaseModel):
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


@router.post("/onboard", response_model=CandidateProfile, status_code=201)
def self_onboard_candidate(
    req: SelfOnboardingRequest,
    db: Database = Depends(get_db),
):
    """Public self-onboarding for candidates. No authentication required."""
    try:
        from utils.candidate_id import generate_candidate_id
        from services.qr_service import generate_qr_for_candidate

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
            onboarding_type="self",  # Self-onboarding
            onboarded_by=None,  # No user
            status="yet_to_interview",
        )
        
        r = db[CANDIDATES].insert_one(doc)
        doc["_id"] = r.inserted_id
        
        # Generate QR code
        try:
            generate_qr_for_candidate(db, doc, base_url="")
        except Exception as e:
            print(f"Warning: QR generation failed: {e}")
        
        return CandidateProfile(**doc_to_candidate_profile(doc))
    except Exception as e:
        print(f"Error in self-onboarding: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")
