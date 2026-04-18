"""
Pydantic schemas for Report API responses
"""
from typing import List, Optional
from datetime import date
from pydantic import BaseModel


class RevenueData(BaseModel):
    """Revenue data for a specific date"""
    date: str
    total_revenue: float
    order_count: int


class RevenueReport(BaseModel):
    """Revenue report response"""
    start_date: str
    end_date: str
    total_revenue: float
    total_orders: int
    daily_data: List[RevenueData]


class OrderStats(BaseModel):
    """Order statistics"""
    total_orders: int
    pending_orders: int
    completed_orders: int
    cancelled_orders: int
    total_revenue: float


class WaiterPerformance(BaseModel):
    """Waiter performance metrics"""
    waiter_id: str
    waiter_name: str
    total_orders: int
    total_revenue: float
    total_hours_worked: float


class TopProduct(BaseModel):
    """Top selling product"""
    product_id: str
    product_name: str
    quantity_sold: int
    revenue: float
