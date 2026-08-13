'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ROUTES } from '@/constants';
import { formatOrderStatus } from '@/lib/order-status';
import { formatCurrency } from '@/lib/utils';
import { cancelOrder, getOrder } from '@/services/orders.client';
import type { OrderItem, OrderSummary } from '@/types/commerce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function remainingQty(item: OrderItem): number {
  const qty = Number(item.quantity) || 0;
  const cancelled = Number(item.cancelQuantity) || 0;
  return Math.max(qty - cancelled, 0);
}

function canCancelOrder(order: OrderSummary): boolean {
  const status = order.statusId ?? 'ORDER_CREATED';
  return status !== 'ORDER_COMPLETED' && status !== 'ORDER_CANCELLED';
}

export default function AccountOrderDetailPage() {
  const params = useParams();
  const orderId = String(params.orderId ?? '');
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState('');
  const [lineSelections, setLineSelections] = useState<
    Record<string, { selected: boolean; cancelQuantity: string }>
  >({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    getOrder(orderId)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load order'));
  }, [orderId]);

  const cancellableItems = useMemo(() => {
    if (!order?.items) return [];
    return order.items.filter(
      (item) => remainingQty(item) > 0 && item.statusId !== 'ITEM_CANCELLED',
    );
  }, [order]);

  /** Single line with qty 1 — only justification is needed. */
  const simpleCancel =
    cancellableItems.length === 1 && remainingQty(cancellableItems[0]) === 1;

  function openCancelPanel() {
    if (!order) return;
    setError('');
    setSuccess('');
    setReason('');
    const selections: Record<string, { selected: boolean; cancelQuantity: string }> = {};
    for (const item of order.items ?? []) {
      const rem = remainingQty(item);
      if (rem > 0 && item.statusId !== 'ITEM_CANCELLED' && item.orderItemSeqId) {
        selections[item.orderItemSeqId] = {
          selected: true,
          cancelQuantity: String(rem),
        };
      }
    }
    setLineSelections(selections);
    setShowCancel(true);
  }

  async function handleCancel() {
    if (!order) return;
    const justification = reason.trim();
    if (!justification) {
      setError('Please provide a justification for cancelling the order.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      let payload: {
        reason: string;
        cancelAll?: boolean;
        items?: Array<{ orderItemSeqId: string; cancelQuantity: number }>;
      };

      if (simpleCancel) {
        payload = { reason: justification, cancelAll: true };
      } else {
        const items = Object.entries(lineSelections)
          .filter(([, row]) => row.selected)
          .map(([orderItemSeqId, row]) => ({
            orderItemSeqId,
            cancelQuantity: Number(row.cancelQuantity) || 0,
          }))
          .filter((row) => row.cancelQuantity > 0);

        if (items.length === 0) {
          setError('Select at least one item to cancel.');
          setSubmitting(false);
          return;
        }

        // If every remaining unit is selected, cancel the full order
        const selectedCoversAll = cancellableItems.every((item) => {
          const seqId = item.orderItemSeqId ?? '';
          const rem = remainingQty(item);
          const row = items.find((i) => i.orderItemSeqId === seqId);
          return Boolean(row && row.cancelQuantity >= rem);
        });

        payload = selectedCoversAll
          ? { reason: justification, cancelAll: true }
          : { reason: justification, cancelAll: false, items };
      }

      const updated = await cancelOrder(order.orderId, payload);
      setOrder(updated);
      setShowCancel(false);
      setSuccess(
        updated.statusId === 'ORDER_CANCELLED'
          ? 'Order cancelled successfully.'
          : 'Selected items cancelled successfully.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !order) return <p className="text-destructive">{error}</p>;
  if (!order) return <p>Loading order…</p>;

  return (
    <section className="space-y-6">
      <Link href={ROUTES.accountOrders} className="text-sm font-medium underline">
        ← Back to orders
      </Link>

      {success && (
        <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          {success}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-lg border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase">Order {order.orderId}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Status: {formatOrderStatus(order.statusId)}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {formatCurrency(Number(order.grandTotal ?? 0), order.currencyUom)}
            </p>
          </div>
          {canCancelOrder(order) && cancellableItems.length > 0 && !showCancel && (
            <Button type="button" variant="outline" onClick={openCancelPanel}>
              Cancel order
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b p-4 font-semibold uppercase text-sm">Items</div>
        <ul className="divide-y">
          {(order.items ?? []).map((item) => {
            const rem = remainingQty(item);
            const cancelled = Number(item.cancelQuantity) || 0;
            return (
              <li
                key={`${item.productId}-${item.orderItemSeqId ?? ''}`}
                className="flex justify-between gap-4 p-4 text-sm"
              >
                <div>
                  <p>
                    {item.productId} × {Number(item.quantity)}
                  </p>
                  {cancelled > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Cancelled qty: {cancelled}
                      {rem > 0 ? ` · Remaining: ${rem}` : ' · Fully cancelled'}
                    </p>
                  )}
                  {item.statusId && (
                    <p className="text-xs text-muted-foreground">
                      {formatOrderStatus(item.statusId)}
                    </p>
                  )}
                </div>
                <span>
                  {formatCurrency(Number(item.unitPrice) * Number(item.quantity), order.currencyUom)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {showCancel && canCancelOrder(order) && (
        <div className="space-y-4 rounded-lg border p-6">
          <h3 className="font-semibold uppercase tracking-wide">Cancel order</h3>

          {!simpleCancel && (
            <ul className="space-y-3 rounded-md border p-4">
              {cancellableItems.map((item) => {
                const seqId = item.orderItemSeqId ?? '';
                const rem = remainingQty(item);
                const row = lineSelections[seqId] ?? {
                  selected: false,
                  cancelQuantity: String(rem),
                };
                return (
                  <li key={seqId} className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="flex flex-1 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={(e) =>
                          setLineSelections((prev) => ({
                            ...prev,
                            [seqId]: { ...row, selected: e.target.checked },
                          }))
                        }
                      />
                      <span>
                        {item.productId}
                        {rem > 1 ? ` (available ${rem})` : ''}
                      </span>
                    </label>
                    {rem > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Cancel qty</span>
                        <Input
                          type="number"
                          min={1}
                          max={rem}
                          className="w-24"
                          disabled={!row.selected}
                          value={row.cancelQuantity}
                          onChange={(e) =>
                            setLineSelections((prev) => ({
                              ...prev,
                              [seqId]: { ...row, cancelQuantity: e.target.value },
                            }))
                          }
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div>
            <label className="text-sm font-medium" htmlFor="cancel-reason">
              Justification *
            </label>
            <textarea
              id="cancel-reason"
              className="mt-1 min-h-[96px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Why are you cancelling this order?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="destructive"
              disabled={submitting}
              onClick={() => void handleCancel()}
            >
              {submitting ? 'Cancelling…' : 'Confirm cancellation'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => {
                setShowCancel(false);
                setError('');
              }}
            >
              Keep order
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
