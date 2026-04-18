export interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_new?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  description?: string;
  category: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_new?: boolean;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  image_url?: string;
  is_available?: boolean;
  is_new?: boolean;
}

export type ProductCategory = "coffee" | "pastries" | "sandwiches" | "beverages";
