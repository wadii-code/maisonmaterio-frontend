export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number | null;
  category_id: string;
  room_id?: string | null;
  material?: string | null;
  dimensions?: string | null;
  stock: number;
  status: 'active' | 'inactive';
  images: string[];
  tags: string[];
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string };
  rooms?: { name: string; slug: string };
  reviews?: Review[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
  image_url?: string;
  product_count: number;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  discount_text?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: ShippingAddress;
  payment_status: PaymentStatus;
  payment_intent_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  profiles?: Profile;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  products?: Product;
}

export interface Profile {
  id: string;
  role: 'customer' | 'admin';
  full_name: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  created_at: string;
}

export interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: { full_name: string; avatar_url?: string };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
}

export interface DashboardStats {
  total_revenue: number;
  orders_today: number;
  pending_orders: number;
  low_stock_items: number;
  recent_orders: Order[];
}
