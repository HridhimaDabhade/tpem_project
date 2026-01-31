"""
MongoDB document schemas and helpers for TPEML Recruitment Portal.
No SQLAlchemy; use db[collection] for access.
"""
from database import USERS, CANDIDATES, INTERVIEWS, RE_INTERVIEW_REQUESTS, AUDIT_LOGS

__all__ = [
    "USERS",
    "CANDIDATES",
    "INTERVIEWS",
    "RE_INTERVIEW_REQUESTS",
    "AUDIT_LOGS",
]
