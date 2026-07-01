'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants';
import { formatCurrency } from '@/lib/utils';
import { findOrders } from '@/services/orders.client';
import type { OrderSummary } from '@/types/commerce';

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    findOrders()
      .then((page) => setOrders(page.content ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading orders…</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <section className="rounded-lg border">
      <div className="border-b p-4">
        <h2 className="font-semibold uppercase tracking-wide">Orders</h2>
      </div>
      {orders.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="divide-y">
          {orders.map((order) => (
            <li key={order.orderId} className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm">
              <div>
                <Link href={`${ROUTES.accountOrders}/${encodeURIComponent(order.orderId)}`} className="font-medium hover:underline">
                  {order.orderId}
                </Link>
                <p className="text-muted-foreground">{order.statusId ?? 'ORDER_CREATED'}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(Number(order.grandTotal ?? 0), order.currencyUom)}</p>
                {order.orderDate && <p className="text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
