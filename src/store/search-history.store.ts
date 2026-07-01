import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_HISTORY = 10;

interface SearchHistoryStore {
  queries: string[];
  add: (query: string) => void;
  clear: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryStore>()(
  persist(
    (set) => ({
      queries: [],

      add: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((state) => ({
          queries: [trimmed, ...state.queries.filter((q) => q !== trimmed)].slice(
            0,
            MAX_HISTORY,
          ),
        }));
      },

      clear: () => set({ queries: [] }),
    }),
    { name: 'playpro-search-history' },
  ),
);
