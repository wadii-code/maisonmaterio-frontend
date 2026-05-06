import { supabase } from './supabase';
import type { ProductsResponse, Product, Category, Room, Order, DashboardStats } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function getHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Products
export const productsApi = {
  list: (params?: Record<string, string | number | undefined>): Promise<ProductsResponse> => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return request(`/products${qs}`);
  },
  get: (id: string): Promise<Product> => request(`/products/${id}`),
  create: (data: Partial<Product>): Promise<Product> => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Product>): Promise<Product> => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> => request(`/products/${id}`, { method: 'DELETE' }),
  bulkUpdate: (data: { ids: string[]; action: string; status?: string }): Promise<{ message: string }> =>
    request('/products/bulk', { method: 'PUT', body: JSON.stringify(data) }),
};

// Categories & Rooms
export const categoriesApi = {
  list: (): Promise<Category[]> => request('/categories'),
};

export const roomsApi = {
  list: (): Promise<Room[]> => request('/rooms'),
};

// Orders
export const ordersApi = {
  list: (params?: Record<string, string>): Promise<{ data: Order[]; pagination: any }> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/orders${qs}`);
  },
  get: (id: string): Promise<Order> => request(`/orders/${id}`),
  create: (data: any): Promise<Order> => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string, notes?: string): Promise<Order> =>
    request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, notes }) }),
  getDashboardStats: (): Promise<DashboardStats> => request('/orders/dashboard-stats'),
};
