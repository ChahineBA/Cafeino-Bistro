"""
Pydantic schemas for Order API requests and responses
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    """Schema for creating an order item"""
    product_id: str
    product_name: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    subtotal: float = Field(..., gt=0)


class OrderCreate(BaseModel):
    """Schema for creating a new order"""
    items: List[OrderItemCreate] = Field(..., min_length=1)
    notes: Optional[str] = Field(None, max_length=500)


class OrderUpdate(BaseModel):
    """Schema for updating an order"""
    status: Optional[str] = Field(None, pattern="^(pending|completed|cancelled)$")
    items: Optional[List[OrderItemCreate]] = None
    total: Optional[float] = Field(None, gt=0)
    notes: Optional[str] = Field(None, max_length=500)


class OrderItemResponse(BaseModel):
    """Schema for order item response"""
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    subtotal: float


class OrderResponse(BaseModel):
    """Schema for order response"""
    id: str = Field(..., alias="_id")
    order_number: str
    items: List[OrderItemResponse]
    total: float
    status: str
    waiter_id: str
    waiter_name: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
