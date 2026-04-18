"""
Product model for MongoDB
Represents menu items in the coffee shop
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId


class ProductModel(BaseModel):
    """Product document model for MongoDB"""
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    description: Optional[str] = None
    category: str  # e.g., "coffee", "pastries", "sandwiches", "beverages"
    price: float
    image_url: Optional[str] = None
    is_available: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
