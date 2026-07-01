import type { OrderSummary } from '@/types/commerce';

export interface OrderPageResponse {
  content: OrderSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function createOrder(payload: {
  items: import('@/types/commerce').CartItem[];
  guestEmail?: string;
  guestFirstName?: string;
  guestLastName?: string;
  orderName?: string;
}): Promise<OrderSummary> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to place order');
  return data;
}

export async function findOrders(page = 0, size = 20): Promise<OrderPageResponse> {
  const res = await fetch('/api/orders/find', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, size }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to load orders');
  return data;
}

export async function getOrder(orderId: string): Promise<OrderSummary> {
  const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to load order');
  return data;
}
