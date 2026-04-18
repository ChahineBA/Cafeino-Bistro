"""
Orders router
Handles order creation and management
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import random
import string
from ..schemas.order import OrderCreate, OrderUpdate, OrderResponse
from ..database import get_orders_collection
from ..utils.dependencies import get_current_user


router = APIRouter()


def generate_order_number() -> str:
    """Generate a unique order number"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{timestamp}-{random_str}"


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new order"""
    orders_collection = get_orders_collection()
    
    # Calculate total
    total = sum(item.subtotal for item in order_data.items)
    
    order_dict = {
        "order_number": generate_order_number(),
        "items": [item.model_dump() for item in order_data.items],
        "total": total,
        "status": "pending",
        "waiter_id": str(current_user["_id"]),
        "waiter_name": current_user["full_name"],
        "notes": order_data.notes,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await orders_collection.insert_one(order_dict)
    order_dict["_id"] = str(result.inserted_id)
    
    return OrderResponse(**order_dict)


@router.get("", response_model=List[OrderResponse])
async def get_orders(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get orders
    Waiters see only their orders, admins see all orders
    """
    orders_collection = get_orders_collection()
    
    # Build query
    query = {}
    
    # Filter by waiter if not admin
    if current_user.get("role") != "admin":
        query["waiter_id"] = str(current_user["_id"])
    
    # Filter by status if provided
    if status_filter:
        query["status"] = status_filter
    
    orders = await orders_collection.find(query).sort("created_at", -1).to_list(1000)
    
    # Convert ObjectId to string
    for order in orders:
        order["_id"] = str(order["_id"])
    
    return [OrderResponse(**order) for order in orders]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific order by ID"""
    orders_collection = get_orders_collection()
    
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to view this order
    if current_user.get("role") != "admin" and order["waiter_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    order["_id"] = str(order["_id"])
    return OrderResponse(**order)


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str,
    order_data: OrderUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update order status"""
    orders_collection = get_orders_collection()
    
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    # Check if order exists and user has permission
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if current_user.get("role") != "admin" and order["waiter_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this order"
        )
    
    # Build update data - only include fields that are provided
    update_data = {"updated_at": datetime.utcnow()}
    
    if order_data.status is not None:
        update_data["status"] = order_data.status
    
    if order_data.items is not None:
        update_data["items"] = [item.model_dump() for item in order_data.items]
    
    if order_data.total is not None:
        update_data["total"] = order_data.total
    
    if order_data.notes is not None:
        update_data["notes"] = order_data.notes
    
    result = await orders_collection.find_one_and_update(
        {"_id": ObjectId(order_id)},
        {"$set": update_data},
        return_document=True
    )
    
    result["_id"] = str(result["_id"])
    return OrderResponse(**result)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel an order (sets status to cancelled)"""
    orders_collection = get_orders_collection()
    
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    # Check if order exists and user has permission
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if current_user.get("role") != "admin" and order["waiter_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this order"
        )
    
    # Update order status to cancelled
    await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}}
    )
    
    return None
