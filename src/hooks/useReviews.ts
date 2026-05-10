import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
  return headers;
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface ReviewEligibility {
  can_review: boolean;
  has_purchased: boolean;
  has_reviewed: boolean;
}

export function useReviewEligibility(productId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['review-eligibility', productId],
    queryFn: () => req<ReviewEligibility>(`/reviews/eligibility/${productId}`),
    enabled: enabled && !!productId,
  });
}

export function useCreateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { rating: number; comment: string }) =>
      req(`/reviews`, { method: 'POST', body: JSON.stringify({ product_id: productId, ...data }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', productId] });
      qc.invalidateQueries({ queryKey: ['review-eligibility', productId] });
    },
  });
}

export function useAdminReviews(params?: { status?: string }) {
  return useQuery({
    queryKey: ['admin-reviews', params],
    queryFn: () => req<any[]>(`/reviews/admin${params?.status ? `?status=${params.status}` : ''}`),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => req(`/reviews/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });
}
