import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

type Customization = NonNullable<CartItem['customization']>;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, customization?: Customization) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

function lineKey(productId: string, c?: Customization) {
  const colorPart = c?.color?.hex ?? 'default';
  return `${productId}__${colorPart}`;
}

function unitPrice(item: CartItem) {
  return (
    item.customization?.unitPrice ??
    item.product.discount_price ??
    item.product.price
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, customization) => {
        if (product.stock <= 0) {
          // Can't add out-of-stock items.
          return;
        }
        const key = lineKey(product.id, customization);
        set(state => {
          const existing = state.items.find(i => i.key === key);
          if (existing) {
            const newQty = Math.min(existing.quantity + quantity, product.stock);
            return {
              items: state.items.map(i => (i.key === key ? { ...i, quantity: newQty } : i)),
            };
          }
          const startQty = Math.min(quantity, product.stock);
          return {
            items: [...state.items, { key, product, quantity: startQty, customization }],
          };
        });
        set({ isOpen: true });
      },

      removeItem: (key) => {
        set(state => ({ items: state.items.filter(i => i.key !== key) }));
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set(state => ({
          items: state.items.map(i => (i.key === key ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0),
    }),
    {
      name: 'swipo-cart',
      version: 2,
      partialize: (state) => ({ items: state.items }),
      // If a stored cart from v1 (before line keys / customization) is loaded, regenerate keys.
      migrate: (persisted: any) => {
        if (!persisted || !persisted.items) return persisted;
        return {
          ...persisted,
          items: persisted.items.map((i: any) => ({
            ...i,
            key: i.key ?? lineKey(i.product?.id, i.customization),
          })),
        };
      },
    }
  )
);
