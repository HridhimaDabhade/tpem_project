"""
JWT creation, validation, and RBAC.
Role-based route protection via require_roles dependency.
"""
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo.database import Database

from config import get_settings
from database import get_db, USERS
from models.user import UserView, user_from_doc

settings = get_settings()
# Use argon2 instead of bcrypt for better compatibility
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
http_bearer = HTTPBearer(auto_error=False)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None


def get_user_by_email(db: Database, email: str) -> Optional[UserView]:
    d = db[USERS].find_one({"email": email})
    return user_from_doc(d) if d else None


def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    db: Database = Depends(get_db),
) -> Optional[UserView]:
    """Resolve JWT and return current user. Returns None if no/invalid token."""
    if not creds or not creds.credentials:
        return None
    payload = decode_token(creds.credentials)
    if not payload:
        return None
    sub = payload.get("sub")
    if not sub:
        return None
    d = db[USERS].find_one({"email": sub})
    return user_from_doc(d) if d else None


def require_auth(current_user: Optional[UserView] = Depends(get_current_user)) -> UserView:
    """Dependency: require valid JWT. Raise 401 if missing/invalid."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


def require_roles(allowed_roles: List[str]):
    """Dependency factory: require user to have one of the given roles."""

    def _require_role(user: UserView = Depends(require_auth)) -> UserView:
        if user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return _require_role
