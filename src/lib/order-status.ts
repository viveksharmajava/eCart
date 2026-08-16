/** Maps OFBiz-style order status ids to customer-facing labels. */
const ORDER_STATUS_LABELS: Record<string, string> = {
  ORDER_CREATED: 'Created',
  ORDER_PROCESSING: 'Processing',
  ORDER_APPROVED: 'Approved',
  ORDER_SENT: 'Shipped',
  ORDER_HOLD: 'Held',
  ORDER_COMPLETED: 'Completed',
  ORDER_REJECTED: 'Rejected',
  ORDER_CANCELLED: 'Cancelled',
  ITEM_CREATED: 'Created',
  ITEM_APPROVED: 'Approved',
  ITEM_SHIPPED: 'Shipped',
  ITEM_COMPLETED: 'Completed',
  ITEM_REJECTED: 'Rejected',
  ITEM_CANCELLED: 'Cancelled',
};

/**
 * Converts an internal status id (e.g. ORDER_CREATED) into display text (e.g. Created).
 */
export function formatOrderStatus(statusId?: string | null): string {
  const raw = (statusId ?? '').trim();
  if (!raw) return 'Created';
  const known = ORDER_STATUS_LABELS[raw];
  if (known) return known;

  const withoutPrefix = raw
    .replace(/^ORDER_/, '')
    .replace(/^ITEM_/, '')
    .replace(/^PAYMENT_/, '');

  return withoutPrefix
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/** Active (non-cancelled) quantity on a line. */
export function remainingOrderQty(item: {
  quantity?: number;
  cancelQuantity?: number;
}): number {
  const qty = Number(item.quantity) || 0;
  const cancelled = Number(item.cancelQuantity) || 0;
  return Math.max(qty - cancelled, 0);
}

/**
 * Customer-facing line status, including "Partially shipped" when only some units shipped.
 */
export function formatItemShipStatus(item: {
  quantity?: number;
  cancelQuantity?: number;
  shippedQuantity?: number;
  statusId?: string | null;
}): string {
  const remaining = remainingOrderQty(item);
  const shipped = Number(item.shippedQuantity) || 0;

  if (item.statusId === 'ITEM_CANCELLED' || remaining <= 0) {
    return 'Cancelled';
  }
  if (shipped <= 0) {
    return formatOrderStatus(item.statusId);
  }
  if (shipped < remaining) {
    return `Partially shipped (${shipped} of ${remaining})`;
  }
  if (item.statusId === 'ITEM_COMPLETED') {
    return 'Completed';
  }
  return 'Shipped';
}
