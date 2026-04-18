"""
Reports router
Handles analytics and reporting (Admin only)
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List
from datetime import datetime, timedelta
from collections import defaultdict
from ..schemas.report import RevenueReport, RevenueData, OrderStats, WaiterPerformance, TopProduct
from ..database import get_orders_collection, get_services_collection
from ..utils.dependencies import get_current_admin_user


router = APIRouter()


@router.get("/revenue", response_model=RevenueReport)
async def get_revenue_report(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_admin_user)
):
    """Get revenue report for a date range (Admin only)"""
    orders_collection = get_orders_collection()
    
    # Parse dates
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        end = end.replace(hour=23, minute=59, second=59)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Get orders in date range
    orders = await orders_collection.find({
        "created_at": {"$gte": start, "$lte": end},
        "status": {"$ne": "cancelled"}
    }).to_list(10000)
    
    # Group by date
    daily_revenue = defaultdict(lambda: {"revenue": 0, "count": 0})
    total_revenue = 0
    
    for order in orders:
        order_date = order["created_at"].strftime("%Y-%m-%d")
        daily_revenue[order_date]["revenue"] += order["total"]
        daily_revenue[order_date]["count"] += 1
        total_revenue += order["total"]
    
    # Create daily data list
    daily_data = []
    current_date = start
    while current_date <= end:
        date_str = current_date.strftime("%Y-%m-%d")
        daily_data.append(RevenueData(
            date=date_str,
            total_revenue=daily_revenue[date_str]["revenue"],
            order_count=daily_revenue[date_str]["count"]
        ))
        current_date += timedelta(days=1)
    
    return RevenueReport(
        start_date=start_date,
        end_date=end_date,
        total_revenue=total_revenue,
        total_orders=len(orders),
        daily_data=daily_data
    )


@router.get("/orders", response_model=OrderStats)
async def get_order_stats(
    date: str = Query(..., description="Date (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_admin_user)
):
    """Get order statistics for a specific date (Admin only)"""
    orders_collection = get_orders_collection()
    
    # Parse date
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d")
        next_day = target_date + timedelta(days=1)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Get orders for the date
    orders = await orders_collection.find({
        "created_at": {"$gte": target_date, "$lt": next_day}
    }).to_list(10000)
    
    # Calculate statistics
    total_orders = len(orders)
    pending_orders = sum(1 for o in orders if o["status"] == "pending")
    completed_orders = sum(1 for o in orders if o["status"] == "completed")
    cancelled_orders = sum(1 for o in orders if o["status"] == "cancelled")
    total_revenue = sum(o["total"] for o in orders if o["status"] != "cancelled")
    
    return OrderStats(
        total_orders=total_orders,
        pending_orders=pending_orders,
        completed_orders=completed_orders,
        cancelled_orders=cancelled_orders,
        total_revenue=total_revenue
    )


@router.get("/waiters", response_model=List[WaiterPerformance])
async def get_waiter_performance(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_admin_user)
):
    """Get waiter performance metrics for a date range (Admin only)"""
    orders_collection = get_orders_collection()
    services_collection = get_services_collection()
    
    # Parse dates
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        end = end.replace(hour=23, minute=59, second=59)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Get orders in date range
    orders = await orders_collection.find({
        "created_at": {"$gte": start, "$lte": end},
        "status": {"$ne": "cancelled"}
    }).to_list(10000)
    
    # Get service records in date range
    date_list = []
    current_date = start
    while current_date <= end:
        date_list.append(current_date.strftime("%Y-%m-%d"))
        current_date += timedelta(days=1)
    
    services = await services_collection.find({
        "date": {"$in": date_list}
    }).to_list(10000)
    
    # Group by waiter
    waiter_stats = defaultdict(lambda: {
        "name": "",
        "orders": 0,
        "revenue": 0,
        "hours": 0
    })
    
    for order in orders:
        waiter_id = order["waiter_id"]
        waiter_stats[waiter_id]["name"] = order["waiter_name"]
        waiter_stats[waiter_id]["orders"] += 1
        waiter_stats[waiter_id]["revenue"] += order["total"]
    
    for service in services:
        waiter_id = service["waiter_id"]
        if waiter_stats[waiter_id]["name"] == "":
            waiter_stats[waiter_id]["name"] = service["waiter_name"]
        if service["duration_minutes"]:
            waiter_stats[waiter_id]["hours"] += service["duration_minutes"] / 60
    
    # Create performance list
    performance_list = []
    for waiter_id, stats in waiter_stats.items():
        performance_list.append(WaiterPerformance(
            waiter_id=waiter_id,
            waiter_name=stats["name"],
            total_orders=stats["orders"],
            total_revenue=stats["revenue"],
            total_hours_worked=round(stats["hours"], 2)
        ))
    
    # Sort by revenue
    performance_list.sort(key=lambda x: x.total_revenue, reverse=True)
    
    return performance_list


@router.get("/top-products", response_model=List[TopProduct])
async def get_top_products(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    limit: int = Query(10, description="Number of top products to return"),
    current_user: dict = Depends(get_current_admin_user)
):
    """Get top selling products for a date range (Admin only)"""
    orders_collection = get_orders_collection()
    
    # Parse dates
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        end = end.replace(hour=23, minute=59, second=59)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Get orders in date range
    orders = await orders_collection.find({
        "created_at": {"$gte": start, "$lte": end},
        "status": {"$ne": "cancelled"}
    }).to_list(10000)
    
    # Aggregate product sales
    product_stats = defaultdict(lambda: {"name": "", "quantity": 0, "revenue": 0})
    
    for order in orders:
        for item in order["items"]:
            product_id = item["product_id"]
            product_stats[product_id]["name"] = item["product_name"]
            product_stats[product_id]["quantity"] += item["quantity"]
            product_stats[product_id]["revenue"] += item["subtotal"]
    
    # Create top products list
    top_products = []
    for product_id, stats in product_stats.items():
        top_products.append(TopProduct(
            product_id=product_id,
            product_name=stats["name"],
            quantity_sold=stats["quantity"],
            revenue=stats["revenue"]
        ))
    
    # Sort by quantity sold and limit
    top_products.sort(key=lambda x: x.quantity_sold, reverse=True)
    
    return top_products[:limit]
