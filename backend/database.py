"""
MongoDB connection and database access.
Falls back to mock MongoDB if connection fails.
"""
from typing import Generator

from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ServerSelectionTimeoutError

# Re-export for convenience
__all__ = ["get_db", "USERS", "CANDIDATES", "INTERVIEWS", "RE_INTERVIEW_REQUESTS", "AUDIT_LOGS"]

from config import get_settings

settings = get_settings()
_client: MongoClient | None = None
_is_mock = False

# Collection names
USERS = "users"
CANDIDATES = "candidates"
INTERVIEWS = "interviews"
RE_INTERVIEW_REQUESTS = "re_interview_requests"
AUDIT_LOGS = "audit_logs"


def get_client() -> MongoClient:
    global _client, _is_mock
    if _client is None:
        try:
            test_client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=2000,
            )
            # Test connection
            test_client.admin.command('ping')
            _client = test_client
            print("✅ Connected to MongoDB")
        except (ServerSelectionTimeoutError, Exception) as e:
            print(f"⚠️  MongoDB not available: {e}")
            print("📝 Using in-memory mock MongoDB for development")
            from mock_mongodb import MockMongoClient
            _client = MockMongoClient(settings.MONGODB_URI)
            _is_mock = True
    return _client

def _get_db() -> Database:
    """Return MongoDB database instance (internal use)."""
    return get_client()[settings.MONGODB_DB]


def get_db() -> Generator[Database, None, None]:
    """FastAPI dependency: yield db."""
    yield _get_db()
