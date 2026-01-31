"""
User Management API (Admin only).
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from pymongo.database import Database

from database import get_db, USERS
from auth.jwt import hash_password, require_roles
from models.user import UserView, user_doc

router = APIRouter(prefix="/api/users", tags=["users"])


class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "hr"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str


class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    req: CreateUserRequest,
    db: Database = Depends(get_db),
    current_user: UserView = Depends(require_roles(["admin"])),
):
    """Create a new user (Admin only)."""
    # Validate role
    valid_roles = ["admin", "hr", "recruiter"]
    if req.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Validate password length
    if len(req.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Check if user already exists
    existing = db[USERS].find_one({"email": req.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{req.email}' already exists"
        )
    
    # Create user document
    doc = user_doc(
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        role=req.role,
    )
    
    result = db[USERS].insert_one(doc)
    
    return UserResponse(
        id=str(result.inserted_id),
        email=req.email,
        full_name=req.full_name,
        role=req.role
    )


@router.get("", response_model=List[UserResponse])
def list_users(
    db: Database = Depends(get_db),
    current_user: UserView = Depends(require_roles(["admin"])),
):
    """List all users (Admin only)."""
    users = db[USERS].find({})
    return [
        UserResponse(
            id=str(u["_id"]),
            email=u["email"],
            full_name=u["full_name"],
            role=u["role"]
        )
        for u in users
    ]


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    db: Database = Depends(get_db),
    current_user: UserView = Depends(require_roles(["admin"])),
):
    """Get user by ID (Admin only)."""
    from bson import ObjectId
    from bson.errors import InvalidId
    
    try:
        user = db[USERS].find_one({"_id": ObjectId(user_id)})
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID")
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"]
    )


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    req: UpdateUserRequest,
    db: Database = Depends(get_db),
    current_user: UserView = Depends(require_roles(["admin"])),
):
    """Update user (Admin only)."""
    from bson import ObjectId
    from bson.errors import InvalidId
    
    try:
        oid = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID")
    
    user = db[USERS].find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Build update dict
    update_dict = {}
    
    if req.full_name is not None:
        update_dict["full_name"] = req.full_name
    
    if req.role is not None:
        valid_roles = ["admin", "hr", "recruiter"]
        if req.role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            )
        update_dict["role"] = req.role
    
    if req.password is not None:
        if len(req.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        update_dict["hashed_password"] = hash_password(req.password)
    
    if update_dict:
        db[USERS].update_one({"_id": oid}, {"$set": update_dict})
    
    # Get updated user
    updated_user = db[USERS].find_one({"_id": oid})
    
    return UserResponse(
        id=str(updated_user["_id"]),
        email=updated_user["email"],
        full_name=updated_user["full_name"],
        role=updated_user["role"]
    )


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    db: Database = Depends(get_db),
    current_user: UserView = Depends(require_roles(["admin"])),
):
    """Delete user (Admin only). Cannot delete yourself."""
    from bson import ObjectId
    from bson.errors import InvalidId
    
    try:
        oid = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID")
    
    # Prevent self-deletion
    if str(oid) == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    result = db[USERS].delete_one({"_id": oid})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return None
