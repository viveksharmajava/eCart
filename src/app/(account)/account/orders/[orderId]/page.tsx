'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ROUTES } from '@/constants';
import { formatCurrency } from '@/lib/utils';
import { getOrder } from '@/services/orders.client';
import type { OrderSummary } from '@/types/commerce';

export default function AccountOrderDetailPage() {
  const params = useParams();
  const orderId = String(params.orderId ?? '');
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;
    getOrder(orderId)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load order'));
  }, [orderId]);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!order) return <p>Loading order…</p>;

  return (
    <section className="space-y-6">
      <Link href={ROUTES.accountOrders} className="text-sm font-medium underline">← Back to orders</Link>
      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-bold uppercase">Order {order.orderId}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Status: {order.statusId ?? 'ORDER_CREATED'}</p>
        <p className="mt-1 text-lg font-semibold">{formatCurrency(Number(order.grandTotal ?? 0), order.currencyUom)}</p>
      </div>
      <div className="rounded-lg border">
        <div className="border-b p-4 font-semibold uppercase text-sm">Items</div>
        <ul className="divide-y">
          {(order.items ?? []).map((item) => (
            <li key={`${item.productId}-${item.orderItemSeqId ?? ''}`} className="flex justify-between p-4 text-sm">
              <span>{item.productId} × {Number(item.quantity)}</span>
              <span>{formatCurrency(Number(item.unitPrice) * Number(item.quantity), order.currencyUom)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
