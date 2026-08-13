'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { isCartSyncPaused, scheduleCartPersist } from '@/lib/cart-sync';
import { useCartStore } from '@/store/cart.store';

/**
 * Keeps the authenticated user's party cart in sync when local cart items change.
 */
export function CartSyncProvider({ children }: { children: ReactNode }) {
  const { user, authHeader, isAuthenticated } = useAuth();
  const partyId = user?.partyId;
  const prevItemsJson = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !partyId || !authHeader) {
      prevItemsJson.current = null;
      return;
    }

    prevItemsJson.current = JSON.stringify(useCartStore.getState().items);

    return useCartStore.subscribe((state) => {
      if (isCartSyncPaused()) return;
      const next = JSON.stringify(state.items);
      if (next === prevItemsJson.current) return;
      prevItemsJson.current = next;
      scheduleCartPersist(partyId, authHeader);
    });
  }, [isAuthenticated, partyId, authHeader]);

  return <>{children}</>;
}
