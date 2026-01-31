"""
TPEML HR Recruitment Portal – FastAPI backend (MongoDB).
"""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import get_settings
from database import get_db, _get_db, USERS
from auth.jwt import hash_password
from routers import auth_router, candidates_router, interview_router, reports_router, re_interview_router, qr_router, dashboard_router

settings = get_settings()

# Static files for QR images
static_dir = Path(__file__).resolve().parent / "static"
static_dir.mkdir(exist_ok=True)
(static_dir / "qr").mkdir(exist_ok=True)


def seed_test_users():
    """Create test users on startup if they don't exist."""
    try:
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
            if not db[USERS].find_one({"email": user["email"]}):
                db[USERS].insert_one(user)
                print(f"✅ Created test user: {user['email']}")
    except Exception as e:
        print(f"⚠️  Could not seed test users: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    seed_test_users()
    yield
    # Shutdown


app = FastAPI(
    title="TPEML HR Recruitment Portal",
    description="Operational workflow layer for HR recruitment at Tata Passenger Electric Mobility Limited.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

app.include_router(auth_router.router)
app.include_router(candidates_router.router)
app.include_router(interview_router.router)
app.include_router(reports_router.router)
app.include_router(re_interview_router.router)
# sync_router (MS Forms) removed — use POST /api/candidates for manual entry
app.include_router(qr_router.router)
app.include_router(dashboard_router.router)


@app.get("/health")
def health():
    return {"status": "ok"}
