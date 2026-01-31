"""
User document – HR, Interviewer, Admin.
MongoDB collection: users.
"""
from datetime import datetime
from typing import Any

from bson import ObjectId


def user_doc(
    email: str,
    hashed_password: str,
    full_name: str,
    role: str = "interviewer",
) -> dict[str, Any]:
    now = datetime.utcnow()
    return {
        "email": email,
        "hashed_password": hashed_password,
        "full_name": full_name,
        "role": role,
        "created_at": now,
        "updated_at": None,
    }


def doc_to_user(d: dict) -> dict:
    """Convert MongoDB user doc to API-friendly dict with 'id'."""
    oid = d.get("_id")
    return {
        "id": str(oid) if oid else None,
        "email": d.get("email"),
        "full_name": d.get("full_name"),
        "role": d.get("role"),
        "created_at": d.get("created_at"),
        "updated_at": d.get("updated_at"),
    }


def user_from_doc(d: dict) -> "UserView":
    """Return a simple view used by auth (oid, id, email, full_name, role)."""
    oid = d["_id"]
    return UserView(
        oid=oid,
        id=str(oid),
        email=d["email"],
        hashed_password=d["hashed_password"],
        full_name=d["full_name"],
        role=d["role"],
    )


class UserView:
    """Minimal user view for auth; attribute access like ORM."""
    __slots__ = ("oid", "id", "email", "hashed_password", "full_name", "role")

    def __init__(self, oid: ObjectId, id: str, email: str, hashed_password: str, full_name: str, role: str):
        self.oid = oid
        self.id = id
        self.email = email
        self.hashed_password = hashed_password
        self.full_name = full_name
        self.role = role
