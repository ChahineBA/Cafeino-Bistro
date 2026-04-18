"""
Pydantic schemas for Service API requests and responses
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ServiceClockIn(BaseModel):
    """Schema for clocking in"""
    pass  # No additional data needed, user info from token


class ServiceClockOut(BaseModel):
    """Schema for clocking out"""
    pass  # No additional data needed, user info from token


class ServiceResponse(BaseModel):
    """Schema for service record response"""
    id: str = Field(..., alias="_id")
    waiter_id: str
    waiter_name: str
    clock_in: datetime
    clock_out: Optional[datetime]
    duration_minutes: Optional[int]
    date: str
    is_active: bool
    
    class Config:
        populate_by_name = True
