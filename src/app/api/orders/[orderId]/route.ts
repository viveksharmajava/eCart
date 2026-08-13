import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { httpClient } from '@/services/http.client';
import { getServiceAuthHeader, parseSessionCookie, SESSION_COOKIE } from '@/lib/session';
import type { OrderSummary } from '@/types/commerce';

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const session = parseSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
    if (!session?.partyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await context.params;
    const order = await httpClient<OrderSummary>(`/orders/${encodeURIComponent(orderId)}`, {
      authHeader: getServiceAuthHeader(),
    });

    if (order.partyId && order.partyId !== session.partyId) {
      return NextResponse.json({ error: 'You do not have access to this order' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load order';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
