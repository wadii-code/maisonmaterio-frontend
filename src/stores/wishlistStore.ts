import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

interface WishlistState {
  items: Product[];
  toggle: (product: Product) => boolean; // returns new "isInWishlist" state
  add: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const exists = get().items.some(p => p.id === product.id);
        if (exists) {
          set(state => ({ items: state.items.filter(p => p.id !== product.id) }));
          return false;
        }
        set(state => ({ items: [product, ...state.items] }));
        return true;
      },

      add: (product) => {
        if (get().items.some(p => p.id === product.id)) return;
        set(state => ({ items: [product, ...state.items] }));
      },

      remove: (productId) => {
        set(state => ({ items: state.items.filter(p => p.id !== productId) }));
      },

      clear: () => set({ items: [] }),

      has: (productId) => get().items.some(p => p.id === productId),

      count: () => get().items.length,
    }),
    {
      name: 'swipo-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
