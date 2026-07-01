import { NextResponse } from 'next/server';
import { httpClient } from '@/services/http.client';
import { getServiceAuthHeader } from '@/lib/session';
import type { OrderSummary } from '@/types/commerce';

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await context.params;
    const order = await httpClient<OrderSummary>(`/orders/${encodeURIComponent(orderId)}`, {
      authHeader: getServiceAuthHeader(),
    });
    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load order';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
