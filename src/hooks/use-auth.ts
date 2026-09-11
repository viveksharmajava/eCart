'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/types/commerce';
import { hydrateAddressesFromParty } from '@/lib/address-sync';
import {
  clearCartOnParty,
  flushCartPersist,
  hydrateCartFromParty,
} from '@/lib/cart-sync';
import { useAddressStore } from '@/store/address.store';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useCheckoutStore } from '@/store/checkout.store';

/** Avoid re-hydrating the same party data repeatedly in one browser session. */
let lastHydratedPartyId: string | null = null;
/** Single in-flight hydrate shared by every useAuth() consumer (header, cart sync, login, …). */
let hydrationInFlight: Promise<boolean> | null = null;
let hydrationPartyId: string | null = null;

function clearStaleAddressCache() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('playpro-addresses');
  }
}

async function hydrateUserData(user: User, authHeader: string): Promise<boolean> {
  try {
    await Promise.all([
      hydrateCartFromParty(user, authHeader),
      hydrateAddressesFromParty(user, authHeader),
    ]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Dedupes cart/address hydration across concurrent useAuth mounts.
 * Marks partyId as hydrated after the first attempt so a failed call cannot loop forever.
 */
async function ensureHydrated(user: User, authHeader: string): Promise<boolean> {
  if (!user.partyId) return true;
  if (lastHydratedPartyId === user.partyId) return true;
  if (hydrationInFlight && hydrationPartyId === user.partyId) {
    return hydrationInFlight;
  }

  const partyId = user.partyId;
  hydrationPartyId = partyId;
  hydrationInFlight = (async () => {
    clearStaleAddressCache();
    try {
      return await hydrateUserData(user, authHeader);
    } finally {
      // Stop infinite re-fetch loops even when party APIs error
      lastHydratedPartyId = partyId;
    }
  })().finally(() => {
    if (hydrationPartyId === partyId) {
      hydrationInFlight = null;
      hydrationPartyId = null;
    }
  });

  return hydrationInFlight;
}

async function fetchMe(): Promise<User | null> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

export function useAuth() {
  const { user, authHeader, isAuthenticated, setSession, clearSession } = useAuthStore();
  const partyId = user?.partyId ?? null;
  const [loading, setLoading] = useState(!isAuthenticated);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (isAuthenticated && user) {
        setLoading(false);
        if (partyId) {
          const header = authHeader ?? `${user.username}:CUSTOMER`;
          await ensureHydrated(user, header);
        }
        return;
      }

      try {
        const me = await fetchMe();
        if (cancelled || !me) return;
        const header = `${me.username}:CUSTOMER`;
        setSession(me, header);
        if (me.partyId) {
          await ensureHydrated(me, header);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
    // Depend on partyId (string), not `user` object identity — avoids hydrate storms.
  }, [isAuthenticated, partyId, authHeader, user, setSession]);

  const establishSession = useCallback(
    async (nextUser: User, authHeaderFromLogin?: string) => {
      const normalizedUser: User = {
        ...nextUser,
        username: String(nextUser.username || '').trim().toLowerCase(),
      };
      const header =
        authHeaderFromLogin?.trim() ||
        `${normalizedUser.username}:CUSTOMER`;
      // Drop previous user's local data before loading this user's party data
      useAddressStore.getState().clearAddresses();
      useCartStore.getState().clearCart();
      useCheckoutStore.getState().reset();
      clearStaleAddressCache();
      lastHydratedPartyId = null;
      hydrationInFlight = null;
      hydrationPartyId = null;
      setSession(normalizedUser, header);
      // Hydrate in background so login can redirect immediately
      void ensureHydrated(normalizedUser, header);
      return normalizedUser;
    },
    [setSession],
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Login failed');
      return establishSession(data.user as User, data.authHeader as string | undefined);
    },
    [establishSession],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Google login failed');
      return establishSession(data.user as User, data.authHeader as string | undefined);
    },
    [establishSession],
  );

  const register = useCallback(
    async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      mobile?: string;
    }) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Registration failed');
      return establishSession(data.user as User, data.authHeader as string | undefined);
    },
    [establishSession],
  );

  const logout = useCallback(async () => {
    const sessionUser = useAuthStore.getState().user;
    const sessionHeader = useAuthStore.getState().authHeader;
    if (sessionUser?.partyId && sessionHeader) {
      try {
        await flushCartPersist(sessionUser.partyId, sessionHeader);
      } catch {
        // Still clear local cart even if sync fails
      }
    }
    useCartStore.getState().clearCart();
    useAddressStore.getState().clearAddresses();
    useCheckoutStore.getState().reset();
    clearStaleAddressCache();
    lastHydratedPartyId = null;
    hydrationInFlight = null;
    hydrationPartyId = null;
    await fetch('/api/auth/logout', { method: 'POST' });
    clearSession();
  }, [clearSession]);

  return {
    user,
    authHeader,
    isAuthenticated: isAuthenticated || Boolean(user?.partyId),
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
  };
}

export async function clearPersistedPartyCart() {
  const sessionUser = useAuthStore.getState().user;
  const sessionHeader = useAuthStore.getState().authHeader;
  if (sessionUser?.partyId && sessionHeader) {
    await clearCartOnParty(sessionUser.partyId, sessionHeader);
  }
}
