"""Audit helper: log actions to audit_logs (MongoDB)."""
from typing import Any, Optional

from bson import ObjectId
from pymongo.database import Database

from database import AUDIT_LOGS
from models.audit_log import audit_log_doc


def log_action(
    db: Database,
    user_oid: Optional[ObjectId],
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[dict[str, Any]] = None,
) -> None:
    """Append an audit log entry."""
    entry = audit_log_doc(
        action,
        user_oid=user_oid,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
    )
    db[AUDIT_LOGS].insert_one(entry)
