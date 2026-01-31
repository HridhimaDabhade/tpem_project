"""
Application configuration – loaded from environment variables.
No hardcoded secrets; use .env for local development.
"""
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


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

    class Config:
        # Ensure the .env next to this file is always used regardless of cwd
        env_file = str(Path(__file__).resolve().parent / ".env")
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
