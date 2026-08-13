'use client';

import { type ReactNode } from 'react';
import { CartSyncProvider } from './cart-sync-provider';
import { QueryProvider } from './query-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <CartSyncProvider>{children}</CartSyncProvider>
    </QueryProvider>
  );
}
