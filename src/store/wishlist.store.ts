import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductSummary } from '@/types/catalog';

interface WishlistStore {
  items: ProductSummary[];
  add: (product: ProductSummary) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  toggle: (product: ProductSummary) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product) =>
        set((state) =>
          state.items.some((i) => i.productId === product.productId)
            ? state
            : { items: [...state.items, product] },
        ),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      has: (productId) => get().items.some((i) => i.productId === productId),

      toggle: (product) => {
        if (get().has(product.productId)) {
          get().remove(product.productId);
        } else {
          get().add(product);
        }
      },
    }),
    { name: 'playpro-wishlist' },
  ),
);
