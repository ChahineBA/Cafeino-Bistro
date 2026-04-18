"""
Authentication router
Handles user login, registration, and token management
"""
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime
from ..schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from ..database import get_users_collection
from ..utils.auth import verify_password, get_password_hash, create_access_token
from ..utils.dependencies import get_current_user


router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    """
    Register a new user (Admin only)
    Only admins can create new user accounts
    """
    # Check if current user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can register new users"
        )
    
    users_collection = get_users_collection()
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = {
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": get_password_hash(user_data.password),
        "role": user_data.role,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    
    return UserResponse(**user_dict)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login endpoint
    Returns JWT token and user information
    """
    users_collection = get_users_collection()
    
    # Find user by email
    user = await users_collection.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    # Prepare user response - ensure all required fields exist
    user["_id"] = str(user["_id"])
    
    # Add updated_at if missing (for backwards compatibility with old user documents)
    if "updated_at" not in user:
        user["updated_at"] = user.get("created_at", datetime.utcnow())
    
    user_response = UserResponse(**user)
    
    return TokenResponse(
        access_token=access_token,
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current user information
    Requires valid JWT token
    """
    current_user["_id"] = str(current_user["_id"])
    
    # Add updated_at if missing (for backwards compatibility)
    if "updated_at" not in current_user:
        current_user["updated_at"] = current_user.get("created_at", datetime.utcnow())
    
    return UserResponse(**current_user)
