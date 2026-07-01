'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/types/commerce';
import { useAuthStore } from '@/store/auth.store';

async function fetchMe(): Promise<User | null> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

export function useAuth() {
  const { user, authHeader, isAuthenticated, setSession, clearSession } = useAuthStore();
  const [loading, setLoading] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchMe()
      .then((me) => {
        if (cancelled || !me) return;
        setSession(me, `${me.username}:CUSTOMER`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, setSession]);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Login failed');
      setSession(data.user, `${data.user.username}:CUSTOMER`);
      return data.user as User;
    },
    [setSession],
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
      setSession(data.user, `${data.user.username}:CUSTOMER`);
      return data.user as User;
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearSession();
  }, [clearSession]);

  return {
    user,
    authHeader,
    isAuthenticated: isAuthenticated || Boolean(user?.partyId),
    loading,
    login,
    register,
    logout,
  };
}
