import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/commerce';

interface AuthStore {
  user: User | null;
  authHeader: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, authHeader: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      authHeader: null,
      isAuthenticated: false,

      setSession: (user, authHeader) =>
        set({ user, authHeader, isAuthenticated: true }),

      clearSession: () =>
        set({ user: null, authHeader: null, isAuthenticated: false }),
    }),
    { name: 'playpro-auth' },
  ),
);
