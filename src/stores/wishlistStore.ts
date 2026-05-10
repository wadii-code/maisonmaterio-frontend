import { create } from 'zustand';
import type { Product } from '../types';

const GUEST_KEY = 'swipo-wishlist:guest';
const userKey = (userId: string) => `swipo-wishlist:user:${userId}`;

interface WishlistState {
  items: Product[];
  currentUserId: string | null;
  toggle: (product: Product) => boolean;
  add: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
  count: () => number;
  hydrate: (userId: string | null) => void;
}

const loadFor = (userId: string | null): Product[] => {
  try {
    const raw = localStorage.getItem(userId ? userKey(userId) : GUEST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveFor = (userId: string | null, items: Product[]) => {
  try {
    localStorage.setItem(userId ? userKey(userId) : GUEST_KEY, JSON.stringify(items));
  } catch { /* quota exceeded — ignore */ }
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: loadFor(null), // initial: guest
  currentUserId: null,

  hydrate: (userId) => {
    const prevUserId = get().currentUserId;
    if (prevUserId === userId) return; // no-op
    const items = loadFor(userId);
    set({ items, currentUserId: userId });
  },

  toggle: (product) => {
    const exists = get().items.some(p => p.id === product.id);
    const next = exists
      ? get().items.filter(p => p.id !== product.id)
      : [product, ...get().items];
    saveFor(get().currentUserId, next);
    set({ items: next });
    return !exists;
  },

  add: (product) => {
    if (get().items.some(p => p.id === product.id)) return;
    const next = [product, ...get().items];
    saveFor(get().currentUserId, next);
    set({ items: next });
  },

  remove: (productId) => {
    const next = get().items.filter(p => p.id !== productId);
    saveFor(get().currentUserId, next);
    set({ items: next });
  },

  clear: () => {
    saveFor(get().currentUserId, []);
    set({ items: [] });
  },

  has: (productId) => get().items.some(p => p.id === productId),
  count: () => get().items.length,
}));
