"""
Sync API: trigger MS Forms ingest. Admin/HR only.
"""
from fastapi import APIRouter, Depends
from pymongo.database import Database

from database import get_db
from auth.jwt import require_auth, require_roles
from models.user import UserView
from services.forms_sync_service import sync_form_responses

router = APIRouter(prefix="/api/sync", tags=["sync"])


@router.post("/forms")
def sync_forms(
    db: Database = Depends(get_db),
    user: UserView = Depends(require_roles(["admin", "hr"])),
):
    """
    Trigger MS Forms response sync.
    Creates candidates, generates IDs + QR. MS Forms remains source of truth.
    """
    base_url = ""
    created, updated = sync_form_responses(db, base_url=base_url)
    return {"created": created, "updated": updated}
