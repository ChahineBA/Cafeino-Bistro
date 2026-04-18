"""
Services router
Handles waiter clock in/out and service tracking
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from ..schemas.service import ServiceResponse
from ..database import get_services_collection
from ..utils.dependencies import get_current_user, get_current_admin_user


router = APIRouter()


@router.post("/clock-in", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def clock_in(current_user: dict = Depends(get_current_user)):
    """Clock in - start a service shift"""
    services_collection = get_services_collection()
    
    # Check if user already has an active service
    active_service = await services_collection.find_one({
        "waiter_id": str(current_user["_id"]),
        "is_active": True
    })
    
    if active_service:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already clocked in. Please clock out first."
        )
    
    # Create new service record
    now = datetime.utcnow()
    service_dict = {
        "waiter_id": str(current_user["_id"]),
        "waiter_name": current_user["full_name"],
        "clock_in": now,
        "clock_out": None,
        "duration_minutes": None,
        "date": now.strftime("%Y-%m-%d"),
        "is_active": True
    }
    
    result = await services_collection.insert_one(service_dict)
    service_dict["_id"] = str(result.inserted_id)
    
    return ServiceResponse(**service_dict)


@router.post("/clock-out", response_model=ServiceResponse)
async def clock_out(current_user: dict = Depends(get_current_user)):
    """Clock out - end a service shift"""
    services_collection = get_services_collection()
    
    # Find active service
    active_service = await services_collection.find_one({
        "waiter_id": str(current_user["_id"]),
        "is_active": True
    })
    
    if not active_service:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not currently clocked in."
        )
    
    # Calculate duration
    clock_out_time = datetime.utcnow()
    clock_in_time = active_service["clock_in"]
    duration = (clock_out_time - clock_in_time).total_seconds() / 60  # minutes
    
    # Update service record
    result = await services_collection.find_one_and_update(
        {"_id": active_service["_id"]},
        {
            "$set": {
                "clock_out": clock_out_time,
                "duration_minutes": int(duration),
                "is_active": False
            }
        },
        return_document=True
    )
    
    result["_id"] = str(result["_id"])
    return ServiceResponse(**result)


@router.get("", response_model=List[ServiceResponse])
async def get_services(
    date_filter: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get service records
    Waiters see only their services, admins see all services
    """
    services_collection = get_services_collection()
    
    # Build query
    query = {}
    
    # Filter by waiter if not admin
    if current_user.get("role") != "admin":
        query["waiter_id"] = str(current_user["_id"])
    
    # Filter by date if provided
    if date_filter:
        query["date"] = date_filter
    
    services = await services_collection.find(query).sort("clock_in", -1).to_list(1000)
    
    # Convert ObjectId to string
    for service in services:
        service["_id"] = str(service["_id"])
    
    return [ServiceResponse(**service) for service in services]


@router.get("/date/{date}", response_model=List[ServiceResponse])
async def get_services_by_date(
    date: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """
    Get all service records for a specific date (Admin only)
    Date format: YYYY-MM-DD
    """
    services_collection = get_services_collection()
    
    services = await services_collection.find({"date": date}).sort("clock_in", -1).to_list(1000)
    
    # Convert ObjectId to string
    for service in services:
        service["_id"] = str(service["_id"])
    
    return [ServiceResponse(**service) for service in services]


@router.get("/active", response_model=Optional[ServiceResponse])
async def get_active_service(current_user: dict = Depends(get_current_user)):
    """Get current user's active service (if clocked in)"""
    services_collection = get_services_collection()
    
    active_service = await services_collection.find_one({
        "waiter_id": str(current_user["_id"]),
        "is_active": True
    })
    
    if not active_service:
        return None
    
    active_service["_id"] = str(active_service["_id"])
    return ServiceResponse(**active_service)
