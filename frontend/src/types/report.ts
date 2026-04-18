export interface RevenueData {
  date: string;
  total_revenue: number;
  order_count: number;
}

export interface RevenueReport {
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_orders: number;
  daily_data: RevenueData[];
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
}

export interface WaiterPerformance {
  waiter_id: string;
  waiter_name: string;
  total_orders: number;
  total_revenue: number;
  total_hours_worked: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}
