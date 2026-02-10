"""
Candidate document – profile from onboarding system.
MongoDB collection: candidates.
Candidate ID format: TPEML-2026-ENG-00412.
"""
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


def candidate_doc(
    candidate_id: str,
    name: str,
    *,
    # Basic info
    ms_form_response_id: str | None = None,
    gender: str | None = None,
    dob: str | None = None,  # Date of birth
    contact_no: str | None = None,
    email: str | None = None,
    residential_address: str | None = None,
    state_of_domicile: str | None = None,
    
    # Interview details
    interview_location: str | None = None,
    date_of_interview: str | None = None,
    year_of_recruitment: str | None = None,
    
    # Education - Diploma
    college_name: str | None = None,
    university_name: str | None = None,
    diploma_enrollment_no: str | None = None,
    diploma_branch: str | None = None,
    diploma_passout_year: str | None = None,
    diploma_percentage: float | None = None,
    any_backlog_in_diploma: str | None = None,
    
    # Education - 10th & 12th
    tenth_percentage: float | None = None,
    tenth_passout_year: str | None = None,
    twelfth_percentage: float | None = None,  # Optional
    twelfth_passout_year: str | None = None,  # Optional
    
    # Onboarding metadata
    onboarding_type: str = "self",  # 'self' or 'by_user'
    onboarded_by: str | None = None,  # User ObjectId if by_user
    
    # Status fields
    status: str = "yet_to_interview",
) -> dict[str, Any]:
    now = datetime.utcnow()
    return {
        "candidate_id": candidate_id,
        "ms_form_response_id": ms_form_response_id,
        
        # Basic info
        "name": name,
        "gender": gender,
        "dob": dob,
        "contact_no": contact_no,
        "email": email,
        "residential_address": residential_address,
        "state_of_domicile": state_of_domicile,
        
        # Interview details
        "interview_location": interview_location,
        "date_of_interview": date_of_interview,
        "year_of_recruitment": year_of_recruitment,
        
        # Education - Diploma
        "college_name": college_name,
        "university_name": university_name,
        "diploma_enrollment_no": diploma_enrollment_no,
        "diploma_branch": diploma_branch,
        "diploma_passout_year": diploma_passout_year,
        "diploma_percentage": diploma_percentage,
        "any_backlog_in_diploma": any_backlog_in_diploma,
        
        # Education - 10th & 12th
        "tenth_percentage": tenth_percentage,
        "tenth_passout_year": tenth_passout_year,
        "twelfth_percentage": twelfth_percentage,
        "twelfth_passout_year": twelfth_passout_year,
        
        # Onboarding metadata
        "onboarding_type": onboarding_type,
        "onboarded_by": onboarded_by,
        
        # Status fields
        "status": status,
        
        # Timestamps
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
        "ms_form_response_id": d.get("ms_form_response_id"),
        
        # Basic info
        "name": d.get("name"),
        "gender": d.get("gender"),
        "dob": d.get("dob"),
        "contact_no": d.get("contact_no"),
        "email": d.get("email"),
        "residential_address": d.get("residential_address"),
        "state_of_domicile": d.get("state_of_domicile"),
        
        # Interview details
        "interview_location": d.get("interview_location"),
        "date_of_interview": d.get("date_of_interview"),
        "year_of_recruitment": d.get("year_of_recruitment"),
        
        # Education - Diploma
        "college_name": d.get("college_name"),
        "university_name": d.get("university_name"),
        "diploma_enrollment_no": d.get("diploma_enrollment_no"),
        "diploma_branch": d.get("diploma_branch"),
        "diploma_passout_year": d.get("diploma_passout_year"),
        "diploma_percentage": d.get("diploma_percentage"),
        "any_backlog_in_diploma": d.get("any_backlog_in_diploma"),
        
        # Education - 10th & 12th
        "tenth_percentage": d.get("tenth_percentage"),
        "tenth_passout_year": d.get("tenth_passout_year"),
        "twelfth_percentage": d.get("twelfth_percentage"),
        "twelfth_passout_year": d.get("twelfth_passout_year"),
        
        # Onboarding metadata
        "onboarding_type": d.get("onboarding_type"),
        "onboarded_by": d.get("onboarded_by"),
        
        # Status fields
        "status": d.get("status"),
        "decision": d.get("decision"),
        "interview_notes": d.get("interview_notes"),

        
        # Timestamps
        "created_at": created_at,
    }


class CandidateProfile(BaseModel):
    """Pydantic model for API responses."""
    id: Optional[str] = None
    candidate_id: str
    ms_form_response_id: Optional[str] = None
    
    # Basic info
    name: str
    gender: Optional[str] = None
    dob: Optional[str] = None
    contact_no: Optional[str] = None
    email: Optional[str] = None
    residential_address: Optional[str] = None
    state_of_domicile: Optional[str] = None
    
    # Interview details
    interview_location: Optional[str] = None
    date_of_interview: Optional[str] = None
    year_of_recruitment: Optional[str] = None
    
    # Education - Diploma
    college_name: Optional[str] = None
    university_name: Optional[str] = None
    diploma_enrollment_no: Optional[str] = None
    diploma_branch: Optional[str] = None
    diploma_passout_year: Optional[str] = None
    diploma_percentage: Optional[float] = None
    any_backlog_in_diploma: Optional[str] = None
    
    # Education - 10th & 12th
    tenth_percentage: Optional[float] = None
    tenth_passout_year: Optional[str] = None
    twelfth_percentage: Optional[float] = None
    twelfth_passout_year: Optional[str] = None
    
    # Onboarding metadata
    onboarding_type: Optional[str] = None
    onboarded_by: Optional[str] = None
    
    # Status fields
    status: str
    decision: Optional[str] = None
    interview_notes: Optional[str] = None

    
    # Timestamps
    created_at: Optional[str] = None
