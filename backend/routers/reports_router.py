from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pymongo.database import Database
from io import BytesIO
import openpyxl

from database import get_db, CANDIDATES
from auth.jwt import require_auth
from models.user import UserView

router = APIRouter(prefix="/api/reports", tags=["reports"])
@router.get("/all-candidates")
def download_all_candidates(
    db: Database = Depends(get_db),
    user: UserView = Depends(require_auth),
):
    candidates = list(db[CANDIDATES].find({}).sort("created_at", -1))

    if not candidates:
        raise HTTPException(status_code=404, detail="No candidates found")

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "All Candidates"

    headers = list(candidates[0].keys())
    ws.append(headers)

    for c in candidates:
        ws.append([c.get(h) for h in headers])

    stream = BytesIO()
    wb.save(stream)
    stream.seek(0)

    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=all-candidates.xlsx"
        },
    )
@router.get("/branch-summary")
def download_branch_summary(
    db: Database = Depends(get_db),
    user: UserView = Depends(require_auth),
):
    candidates = list(db[CANDIDATES].find({}))

    summary = {}

    for c in candidates:
        branch = c.get("diploma_branch") or "Unknown"
        decision = c.get("decision")

        if branch not in summary:
            summary[branch] = {
                "shortlist": 0,
                "reject": 0,
                "total": 0
            }

        if decision == "shortlist":
            summary[branch]["shortlist"] += 1
        elif decision == "reject":
            summary[branch]["reject"] += 1

        summary[branch]["total"] += 1

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Branch Summary"

    ws.append(["Branch", "Shortlisted", "Not-Shortlisted", "Grand Total"])

    for branch, data in summary.items():
        ws.append([
            branch,
            data["shortlist"],
            data["reject"],
            data["total"]
        ])

    stream = BytesIO()
    wb.save(stream)
    stream.seek(0)

    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=branch-summary.xlsx"
        },
    )
