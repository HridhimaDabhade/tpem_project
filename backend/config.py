"""
Application configuration – loaded from environment variables.
No hardcoded secrets; use .env for local development.
"""
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv

# Load .env.local only in development (local testing)
if os.getenv('APP_ENV') != 'production':
    local_env = Path(__file__).resolve().parent / ".env.local"
    if local_env.exists():
        load_dotenv(local_env)

# Then load .env
main_env = Path(__file__).resolve().parent / ".env"
if main_env.exists():
    load_dotenv(main_env)


class Settings(BaseSettings):
    """Central config for TPEML Recruitment Portal."""

    # Database (MongoDB)
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "tpeml_recruitment"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480

    # MS Forms (sync service)
    MS_FORMS_FORM_ID: str = ""
    MS_FORMS_TENANT_ID: str = ""
    MS_FORMS_CLIENT_ID: str = ""
    MS_FORMS_CLIENT_SECRET: str = ""

    # App
    APP_ENV: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
