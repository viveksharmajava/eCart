/** Maps OFBiz-style order status ids to customer-facing labels. */
const ORDER_STATUS_LABELS: Record<string, string> = {
  ORDER_CREATED: 'Created',
  ORDER_PROCESSING: 'Processing',
  ORDER_APPROVED: 'Approved',
  ORDER_SENT: 'Sent',
  ORDER_HOLD: 'Held',
  ORDER_COMPLETED: 'Completed',
  ORDER_REJECTED: 'Rejected',
  ORDER_CANCELLED: 'Cancelled',
  ITEM_CREATED: 'Created',
  ITEM_APPROVED: 'Approved',
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
