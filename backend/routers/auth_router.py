"""
Auth API: login (JWT), me, optional seed.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from pymongo.database import Database

from database import get_db, USERS
from auth.jwt import (
    hash_password,
    verify_password,
    create_access_token,
    get_user_by_email,
    require_auth,
)
from models.user import UserView, user_doc

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class MeResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Database = Depends(get_db)):
    """Authenticate and return JWT + user info."""
    user = get_user_by_email(db, req.email)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(data={"sub": user.email})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role},
    )


@router.get("/me", response_model=MeResponse)
def me(user: UserView = Depends(require_auth)):
    """Return current user from JWT."""
    return MeResponse(id=user.id, email=user.email, full_name=user.full_name, role=user.role)
