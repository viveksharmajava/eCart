'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';
import { findOrders } from '@/services/orders.client';
import type { OrderSummary } from '@/types/commerce';

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    findOrders(0, 5)
      .then((page) => setOrders(page.content ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load orders'));
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-lg border p-6">
        <h2 className="font-semibold uppercase tracking-wide">Profile</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div><dt className="text-muted-foreground">Email</dt><dd>{user?.email ?? user?.username}</dd></div>
          <div><dt className="text-muted-foreground">Party ID</dt><dd>{user?.partyId ?? '—'}</dd></div>
        </dl>
        <Link href={ROUTES.accountProfile} className="mt-4 inline-block text-sm font-medium underline">
          Edit profile
        </Link>
      </section>

      <section className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold uppercase tracking-wide">Recent orders</h2>
          <Link href={ROUTES.accountOrders} className="text-sm font-medium underline">View all</Link>
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <ul className="mt-4 space-y-3">
          {orders.length === 0 && !error && <li className="text-sm text-muted-foreground">No orders yet.</li>}
          {orders.map((order) => (
            <li key={order.orderId} className="flex items-center justify-between text-sm">
              <Link href={`${ROUTES.accountOrders}/${encodeURIComponent(order.orderId)}`} className="font-medium hover:underline">
                {order.orderId}
              </Link>
              <span>{formatCurrency(Number(order.grandTotal ?? 0), order.currencyUom)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
