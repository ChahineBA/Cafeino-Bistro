"""
Products router
Handles product CRUD operations (Admin only)
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from datetime import datetime
from ..schemas.product import ProductCreate, ProductUpdate, ProductResponse
from ..database import get_products_collection
from ..utils.dependencies import get_current_admin_user


router = APIRouter()


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new product (Admin only)"""
    products_collection = get_products_collection()
    
    product_dict = product_data.model_dump()
    product_dict["created_at"] = datetime.utcnow()
    product_dict["updated_at"] = datetime.utcnow()
    
    result = await products_collection.insert_one(product_dict)
    product_dict["_id"] = str(result.inserted_id)
    
    return ProductResponse(**product_dict)


@router.get("", response_model=List[ProductResponse])
async def get_products():
    """Get all products (Available to all authenticated users)"""
    products_collection = get_products_collection()
    
    products = await products_collection.find().to_list(1000)
    
    # Convert ObjectId to string
    for product in products:
        product["_id"] = str(product["_id"])
    
    return [ProductResponse(**product) for product in products]


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    products_collection = get_products_collection()
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product["_id"] = str(product["_id"])
    return ProductResponse(**product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Update a product (Admin only)"""
    products_collection = get_products_collection()
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    # Get update data (only fields that were provided)
    update_data = product_data.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await products_collection.find_one_and_update(
        {"_id": ObjectId(product_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    result["_id"] = str(result["_id"])
    return ProductResponse(**result)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete a product (Admin only)"""
    products_collection = get_products_collection()
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    result = await products_collection.delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return None
