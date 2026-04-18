"""
Users router
Handles user management (CRUD operations for waiters/admins)
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from datetime import datetime
from ..schemas.user import UserCreate, UserUpdate, UserResponse
from ..database import get_users_collection
from ..utils.dependencies import get_current_user, require_admin
from ..utils.auth import get_password_hash


router = APIRouter()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: dict = Depends(require_admin)
):
    """Create a new user (Admin only)"""
    users_collection = get_users_collection()
    
    # Check if email already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_dict = {
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "role": user_data.role,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    
    return UserResponse(**user_dict)


@router.get("", response_model=List[UserResponse])
async def get_users(
    current_user: dict = Depends(require_admin)
):
    """Get all users (Admin only)"""
    users_collection = get_users_collection()
    
    users = await users_collection.find({}).to_list(1000)
    
    # Convert ObjectId to string and add updated_at if missing
    for user in users:
        user["_id"] = str(user["_id"])
        # Add updated_at if missing (for backwards compatibility)
        if "updated_at" not in user:
            user["updated_at"] = user.get("created_at", datetime.utcnow())
    
    return [UserResponse(**user) for user in users]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """Get a specific user by ID (Admin only)"""
    users_collection = get_users_collection()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user["_id"] = str(user["_id"])
    
    # Add updated_at if missing (for backwards compatibility)
    if "updated_at" not in user:
        user["updated_at"] = user.get("created_at", datetime.utcnow())
    
    return UserResponse(**user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: dict = Depends(require_admin)
):
    """Update user information (Admin only)"""
    users_collection = get_users_collection()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    # Check if user exists
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Build update data - only include fields that are provided
    update_data = {"updated_at": datetime.utcnow()}
    
    if user_data.full_name is not None:
        update_data["full_name"] = user_data.full_name
    
    if user_data.email is not None:
        # Check if email is already taken by another user
        existing_user = await users_collection.find_one({
            "email": user_data.email,
            "_id": {"$ne": ObjectId(user_id)}
        })
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        update_data["email"] = user_data.email
    
    if user_data.password is not None:
        update_data["hashed_password"] = get_password_hash(user_data.password)
    
    if user_data.role is not None:
        update_data["role"] = user_data.role
    
    if user_data.is_active is not None:
        update_data["is_active"] = user_data.is_active
    
    # Update user
    result = await users_collection.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True
    )
    
    result["_id"] = str(result["_id"])
    return UserResponse(**result)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """Delete a user (Admin only)"""
    users_collection = get_users_collection()
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    # Check if user exists
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting yourself
    if str(user["_id"]) == str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user
    await users_collection.delete_one({"_id": ObjectId(user_id)})
    
    return None
