import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types/commerce';
import { trackEvent } from '@/lib/analytics';

interface CartStore {
  items: CartItem[];
  couponCode?: string;
  couponDiscount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  itemCount: () => number;
  subtotal: () => number;
  total: () => number;
}

function itemKey(productId: string, variantId?: string) {
  return variantId ? `${productId}:${variantId}` : productId;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponDiscount: 0,

      addItem: (item) => {
        set((state) => {
          const key = itemKey(item.productId, item.variantId);
          const existing = state.items.find(
            (i) => itemKey(i.productId, i.variantId) === key,
          );
          const items = existing
            ? state.items.map((i) =>
                itemKey(i.productId, i.variantId) === key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              )
            : [...state.items, item];
          return { items };
        });
        trackEvent({
          name: 'add_to_cart',
          productId: item.productId,
          quantity: item.quantity,
          value: item.unitPrice * item.quantity,
        });
      },

      removeItem: (productId, variantId) => {
        const key = itemKey(productId, variantId);
        set((state) => ({
          items: state.items.filter((i) => itemKey(i.productId, i.variantId) !== key),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        const key = itemKey(productId, variantId);
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.productId, i.variantId) === key ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [], couponCode: undefined, couponDiscount: 0 }),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

      removeCoupon: () => set({ couponCode: undefined, couponDiscount: 0 }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      total: () => Math.max(0, get().subtotal() - get().couponDiscount),
    }),
    { name: 'playpro-cart' },
  ),
);
