import { supabase } from './supabase';
import type { ProductsResponse, Product, Category, Room, Order, DashboardStats, AdminAccount } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function getHeaders(forceRefresh = false): Promise<HeadersInit> {
  let session = (await supabase.auth.getSession()).data.session;
  const hadSession = !!session;

  // Refresh if asked, near expiry, OR if there's a session record without a usable token
  // (handles stale localStorage state, e.g. right after a tab restore).
  const needsRefresh =
    forceRefresh ||
    (hadSession && !session?.access_token) ||
    (session?.expires_at !== undefined && session.expires_at * 1000 < Date.now() + 30_000);

  if (needsRefresh) {
    try {
      const refreshed = await supabase.auth.refreshSession();
      if (refreshed.data.session) session = refreshed.data.session;
    } catch (e) {
      console.warn('[api] refreshSession failed:', e);
    }
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  } else if (hadSession) {
    // Only warn when we expected a token (session existed) but couldn't get one.
    // Guest visitors hitting public endpoints land here too — that's normal, so no log.
    console.warn('[api] Session exists but no access_token — request will be unauthenticated');
  }
  return headers;
}

async function request<T>(path: string, options?: RequestInit, retried = false): Promise<T> {
  const headers = await getHeaders(retried);
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...headers, ...options?.headers } });

  // Auto-retry once on 401 with a forced refresh (handles expired access tokens)
  if (res.status === 401 && !retried) {
    return request<T>(path, options, true);
  }

  if (res.status === 401 && retried) {
    // Refresh + retry both failed — session is truly dead. Sign the user out
    // so the UI re-prompts for login instead of showing a stale "signed in" state.
    await supabase.auth.signOut().catch(() => {});
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
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
  create: (data: { name: string; image_url?: string | null }): Promise<Category> =>
    request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Category>): Promise<Category> =>
    request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> => request(`/categories/${id}`, { method: 'DELETE' }),
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
  updateStatus: (id: string, payload: { status?: string; notes?: string; payment_status?: string } | string, legacyNotes?: string): Promise<Order> => {
    // Backwards compat: old signature was (id, status, notes)
    const body = typeof payload === 'string' ? { status: payload, notes: legacyNotes } : payload;
    return request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(body) });
  },
  getDashboardStats: (): Promise<DashboardStats> => request('/orders/dashboard-stats'),
};

// Admins (super_admin only)
export interface CreateAdminPayload {
  email: string;
  password: string;
  full_name: string;
  role?: 'super_admin' | 'sub_admin';
}

export interface UpdateAdminPayload {
  full_name?: string;
  role?: 'super_admin' | 'sub_admin';
  password?: string;
}

export const adminsApi = {
  list: (): Promise<AdminAccount[]> => request('/admins'),
  create: (data: CreateAdminPayload): Promise<AdminAccount> =>
    request('/admins', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateAdminPayload): Promise<AdminAccount> =>
    request(`/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> =>
    request(`/admins/${id}`, { method: 'DELETE' }),
};
