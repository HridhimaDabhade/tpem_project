"""
Audit log – all material actions logged for Admin audit.
MongoDB collection: audit_logs.
"""
from datetime import datetime
from typing import Any

from bson import ObjectId


def audit_log_doc(
    action: str,
    *,
    user_oid: ObjectId | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    details: dict | None = None,
) -> dict[str, Any]:
    return {
        "user_id": user_oid,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": details,
        "created_at": datetime.utcnow(),
    }
