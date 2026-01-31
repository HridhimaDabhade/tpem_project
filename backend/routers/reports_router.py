"""
Reports API: Daily log, Interview results, Audit logs – Excel download.
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from pymongo.database import Database

from database import get_db
from auth.jwt import require_auth, require_roles
from models.user import UserView
from services.excel_service import daily_recruitment_log, interview_results, audit_logs_report

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _parse_date(s: Optional[str]):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


@router.get("/daily-log")
def export_daily_log(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    db: Database = Depends(get_db),
    user: UserView = Depends(require_roles(["admin", "hr"])),
):
    """Download Excel: Daily recruitment log."""
    fd = _parse_date(from_date)
    td = _parse_date(to_date)
    buf = daily_recruitment_log(db, from_date=fd, to_date=td)
    filename = f"tpeml_daily_log_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/interview-results")
def export_interview_results(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    decision: Optional[str] = Query(None),
    db: Database = Depends(get_db),
    user: UserView = Depends(require_roles(["admin", "hr"])),
):
    """Download Excel: Interview results."""
    fd = _parse_date(from_date)
    td = _parse_date(to_date)
    buf = interview_results(db, from_date=fd, to_date=td, role=role, decision=decision)
    filename = f"tpeml_interview_results_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/audit-logs")
def export_audit_logs(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    db: Database = Depends(get_db),
    user: UserView = Depends(require_roles(["admin"])),
):
    """Download Excel: Admin audit logs. Admin only."""
    fd = _parse_date(from_date)
    td = _parse_date(to_date)
    buf = audit_logs_report(db, from_date=fd, to_date=td)
    filename = f"tpeml_audit_logs_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.xlsx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
