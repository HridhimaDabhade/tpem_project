#!/usr/bin/env python3
"""Seed test users into the mock database."""
import sys
sys.path.insert(0, '/Users/hridhimadabhade/tpem_project/backend')

from database import _get_db, USERS
from auth.jwt import hash_password

db = _get_db()

test_users = [
    {
        "email": "admin@example.com",
        "hashed_password": hash_password("admin"),
        "full_name": "Admin User",
        "role": "admin",
    },
    {
        "email": "hr@example.com",
        "hashed_password": hash_password("hr"),
        "full_name": "HR Manager",
        "role": "hr",
    },
    {
        "email": "recruiter@example.com",
        "hashed_password": hash_password("recruiter"),
        "full_name": "Recruiter",
        "role": "recruiter",
    },
]

for user in test_users:
    # Delete existing user if it exists
    db[USERS].delete_one({"email": user["email"]})
    # Insert fresh user
    db[USERS].insert_one(user)
    print(f"✅ Created test user: {user['email']}")

print(f"\n✨ All test users seeded successfully!")
