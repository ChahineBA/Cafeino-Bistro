"""
Service model for MongoDB
Represents waiter service/shift records (clock in/out)
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId


class ServiceModel(BaseModel):
    """Service record document model for MongoDB"""
    id: Optional[str] = Field(default=None, alias="_id")
    waiter_id: str
    waiter_name: str
    clock_in: datetime
    clock_out: Optional[datetime] = None
    duration_minutes: Optional[int] = None  # Calculated when clocking out
    date: str  # Format: YYYY-MM-DD for easy filtering
    is_active: bool = True  # True if still clocked in
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
