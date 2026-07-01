import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EnrichedListProduct } from '@/types/filters';

const MAX_ITEMS = 12;

interface RecentlyViewedStore {
  items: EnrichedListProduct[];
  add: (product: EnrichedListProduct) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],

      add: (product) =>
        set((state) => {
          if (state.items[0]?.productId === product.productId) {
            return state;
          }
          const filtered = state.items.filter((i) => i.productId !== product.productId);
          return { items: [product, ...filtered].slice(0, MAX_ITEMS) };
        }),
    }),
    { name: 'playpro-recently-viewed' },
  ),
);
