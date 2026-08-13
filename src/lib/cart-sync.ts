import type { CartItem, User } from '@/types/commerce';
import {
  clearPartyCart,
  fetchPartyCart,
  mergeCartItems,
  savePartyCart,
} from '@/services/party-cart.service';
import { useCartStore } from '@/store/cart.store';

/** Prevents echo saves while hydrating from the server. */
let syncPaused = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function pauseCartSync() {
  syncPaused = true;
}

export function resumeCartSync() {
  syncPaused = false;
}

export function isCartSyncPaused() {
  return syncPaused;
}

export async function persistCartToParty(
  partyId: string,
  authHeader: string,
  items?: CartItem[],
): Promise<void> {
  const cartItems = items ?? useCartStore.getState().items;
  await savePartyCart(partyId, cartItems, authHeader);
}

export async function clearCartOnParty(partyId: string, authHeader: string): Promise<void> {
  await clearPartyCart(partyId, authHeader);
}

/**
 * Load abandoned cart from party and merge with any local guest items,
 * then replace the local cart.
 */
export async function hydrateCartFromParty(user: User, authHeader: string): Promise<void> {
  if (!user.partyId) {
    useCartStore.getState().clearCart();
    return;
  }

  pauseCartSync();
  try {
    const localItems = useCartStore.getState().items;
    const remote = await fetchPartyCart(user.partyId, authHeader);
    const merged = mergeCartItems(remote.items ?? [], localItems);
    useCartStore.getState().replaceItems(merged);
    if (merged.length > 0) {
      await savePartyCart(user.partyId, merged, authHeader);
    }
  } catch {
    // Keep local cart if party is unavailable
  } finally {
    resumeCartSync();
  }
}

export function scheduleCartPersist(partyId: string, authHeader: string, delayMs = 500) {
  if (syncPaused) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (syncPaused) return;
    const items = useCartStore.getState().items;
    void savePartyCart(partyId, items, authHeader).catch(() => {
      // Best-effort background sync
    });
  }, delayMs);
}

export async function flushCartPersist(partyId: string, authHeader: string): Promise<void> {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  await persistCartToParty(partyId, authHeader);
}
