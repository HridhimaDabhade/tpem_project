"""
Create indexes and seed initial admin user (MongoDB).
Run from backend dir: python init_db.py
Requires MONGODB_URI and MONGODB_DB in .env (or defaults).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import get_client, USERS, CANDIDATES, INTERVIEWS, RE_INTERVIEW_REQUESTS, AUDIT_LOGS
from config import get_settings
from models.user import user_doc
from auth.jwt import hash_password


def main():
    settings = get_settings()
    db = get_client()[settings.MONGODB_DB]

    # Create indexes
    db[USERS].create_index("email", unique=True)
    db[CANDIDATES].create_index("candidate_id", unique=True)
    db[CANDIDATES].create_index("ms_form_response_id", unique=True, sparse=True)
    db[CANDIDATES].create_index("status")
    db[CANDIDATES].create_index("created_at")
    db[INTERVIEWS].create_index("candidate_oid")
    db[INTERVIEWS].create_index("interview_date")
    db[INTERVIEWS].create_index("decision")
    db[RE_INTERVIEW_REQUESTS].create_index("candidate_oid")
    db[RE_INTERVIEW_REQUESTS].create_index("status")
    db[AUDIT_LOGS].create_index("user_id")
    db[AUDIT_LOGS].create_index("created_at")

    # Seed admin user
    existing = db[USERS].find_one({"email": "admin@tpeml.com"})
    if existing:
        print("Admin user already exists.")
        return

    doc = user_doc(
        email="admin@tpeml.com",
        hashed_password=hash_password("Admin@123"),
        full_name="Admin User",
        role="admin",
    )
    db[USERS].insert_one(doc)
    print("Created admin user: admin@tpeml.com / Admin@123")
    print("Created indexes on all collections.")


if __name__ == "__main__":
    main()
