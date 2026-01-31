"""
MongoDB connection and database access.
"""
from typing import Generator

from pymongo import MongoClient
from pymongo.database import Database

# Re-export for convenience
__all__ = ["get_db", "USERS", "CANDIDATES", "INTERVIEWS", "RE_INTERVIEW_REQUESTS", "AUDIT_LOGS"]

from config import get_settings

settings = get_settings()
_client: MongoClient | None = None

# Collection names
USERS = "users"
CANDIDATES = "candidates"
INTERVIEWS = "interviews"
RE_INTERVIEW_REQUESTS = "re_interview_requests"
AUDIT_LOGS = "audit_logs"


def get_client() -> MongoClient:
    """Get MongoDB client, create connection if needed."""
    global _client
    if _client is None:
        _client = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
        )
        # Test connection
        _client.admin.command('ping')
        print("✅ Connected to MongoDB")
    return _client


def _get_db() -> Database:
    """Return MongoDB database instance (internal use)."""
    return get_client()[settings.MONGODB_DB]


def get_db() -> Generator[Database, None, None]:
    """FastAPI dependency: yield db."""
    yield _get_db()
