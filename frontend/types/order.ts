export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  order_number: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  waiter_id: string;
  waiter_name: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  items: OrderItem[];
  notes?: string;
}

export interface OrderUpdate {
  status?: "pending" | "completed" | "cancelled";
  items?: OrderItem[];
  total?: number;
  notes?: string;
}
