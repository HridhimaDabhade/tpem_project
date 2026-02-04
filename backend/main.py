"""
TPEML HR Recruitment Portal – FastAPI backend (MongoDB).
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import get_settings
from routers import auth_router, candidates_router, interview_router, reports_router, re_interview_router, qr_router, dashboard_router, users_router, public_router

settings = get_settings()

# Static files for QR images
static_dir = Path(__file__).resolve().parent / "static"
static_dir.mkdir(exist_ok=True)
(static_dir / "qr").mkdir(exist_ok=True)


app = FastAPI(
    title="TPEML HR Recruitment Portal",
    description="Operational workflow layer for HR recruitment at Tata Passenger Electric Mobility Limited.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Public routes (no auth required)
app.include_router(public_router.router)

# Protected routes (auth required)
app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(candidates_router.router)
app.include_router(interview_router.router)
app.include_router(reports_router.router)
app.include_router(re_interview_router.router)
app.include_router(qr_router.router)
app.include_router(dashboard_router.router)


@app.get("/health")
def health():
    return {"status": "ok"}
