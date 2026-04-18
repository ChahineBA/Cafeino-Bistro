"""
Pydantic schemas for Product API requests and responses
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    """Schema for creating a new product"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    category: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    image_url: Optional[str] = None
    is_available: bool = True


class ProductUpdate(BaseModel):
    """Schema for updating a product"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None


class ProductResponse(BaseModel):
    """Schema for product response"""
    id: str = Field(..., alias="_id")
    name: str
    description: Optional[str]
    category: str
    price: float
    image_url: Optional[str]
    is_available: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
