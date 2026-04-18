"""
Order model for MongoDB
Represents customer orders in the POS system
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId


class OrderItem(BaseModel):
    """Individual item in an order"""
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    subtotal: float


class OrderModel(BaseModel):
    """Order document model for MongoDB"""
    id: Optional[str] = Field(default=None, alias="_id")
    order_number: str  # Unique order identifier
    items: List[OrderItem]
    total: float
    status: str = "pending"  # "pending", "completed", "cancelled"
    waiter_id: str
    waiter_name: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
