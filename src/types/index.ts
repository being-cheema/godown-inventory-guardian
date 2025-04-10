
export interface Product {
  product_id?: number;
  product_name: string;
  description?: string;
  price: number;
  category?: string;
  supplier_id?: number;
  supplier_name?: string;
  total_stock?: number;
}

export interface Supplier {
  supplier_id?: number;
  supplier_name: string;
  first_name?: string;
  last_name?: string;
  contact_phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  locality?: string;
  country?: string;
}

export interface Warehouse {
  warehouse_id?: number;
  warehouse_name: string;
  location?: string;
  contact_number?: string;
}

export interface InventoryRecord {
  record_id?: number;
  product_id: number;
  warehouse_id: number;
  quantity_in_stock: number;
  last_updated?: string;
  expiry_date?: string;
  supplier_id?: number;
  product_name?: string;
  category?: string;
  price?: number;
}

export interface Customer {
  customer_id?: number;
  first_name: string;
  last_name: string;
  name?: string;
  phone_number?: string;
  email?: string;
  shipping_address?: string;
  date_of_birth?: string;
}

export interface Order {
  order_id?: number;
  customer_id: number;
  order_date?: string;
  total_amount: number;
  shipping_address?: string;
  order_status?: string;
  customer_name?: string;
}

export interface OrderItem {
  order_item_id?: number;
  order_id: number;
  product_id: number;
  quantity_ordered: number;
  item_price: number;
  total_price?: number;
  product_name?: string;
}

export interface AlertItem {
  type: 'low-stock' | 'expiring';
  product_id: number;
  product_name: string;
  quantity?: number;
  expiry_date?: string;
  days_remaining?: number;
}
