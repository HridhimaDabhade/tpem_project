"""
Dashboard API: KPI counts for HR portal.
"""
from fastapi import APIRouter, Depends
from pymongo.database import Database

from database import get_db, CANDIDATES
from auth.jwt import require_auth
from models.user import UserView

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/kpis", response_model=dict)
def kpis(
    db: Database = Depends(get_db),
    user: UserView = Depends(require_auth),
):
    """Return counts: yet_to_interview, interview_completed, total."""
    yti = db[CANDIDATES].count_documents({"status": "yet_to_interview"})
    completed = db[CANDIDATES].count_documents({"status": "interview_completed"})
    total = db[CANDIDATES].count_documents({})
    return {
        "yet_to_interview": yti,
        "interview_completed": completed,
        "total_candidates": total,
    }
