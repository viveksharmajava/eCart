import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ApiError, httpClient } from '@/services/http.client';
import { getServiceAuthHeader, parseSessionCookie, SESSION_COOKIE } from '@/lib/session';
import type { OrderSummary } from '@/types/commerce';

interface CancelBody {
  reason?: string;
  cancelAll?: boolean;
  items?: Array<{ orderItemSeqId: string; cancelQuantity: number }>;
}

async function loadOwnedOrder(orderId: string, partyId: string): Promise<OrderSummary> {
  const order = await httpClient<OrderSummary>(`/orders/${encodeURIComponent(orderId)}`, {
    authHeader: getServiceAuthHeader(),
  });
  if (order.partyId && order.partyId !== partyId) {
    throw new ApiError('You do not have access to this order', 403);
  }
  return order;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const session = parseSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
    if (!session?.partyId) {
      return NextResponse.json({ error: 'Please sign in to cancel an order' }, { status: 401 });
    }

    const { orderId } = await context.params;
    const body = (await request.json()) as CancelBody;
    const reason = body.reason?.trim() ?? '';
    if (!reason) {
      return NextResponse.json(
        { error: 'Please provide a justification for cancelling the order' },
        { status: 400 },
      );
    }

    const order = await loadOwnedOrder(orderId, session.partyId);
    if (order.statusId === 'ORDER_COMPLETED') {
      return NextResponse.json({ error: 'Completed orders cannot be cancelled' }, { status: 400 });
    }
    if (order.statusId === 'ORDER_CANCELLED') {
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
    }

    const cancelAll = Boolean(body.cancelAll) || !body.items?.length;
    const payload = cancelAll
      ? { cancelAll: true, reason }
      : {
          cancelAll: false,
          reason,
          items: (body.items ?? []).map((item) => ({
            orderItemSeqId: item.orderItemSeqId,
            cancelQuantity: item.cancelQuantity,
          })),
        };

    if (!cancelAll && (!payload.items || payload.items.length === 0)) {
      return NextResponse.json(
        { error: 'Select at least one item to cancel' },
        { status: 400 },
      );
    }

    const updated = await httpClient<OrderSummary>(
      `/orders/${encodeURIComponent(orderId)}/cancel`,
      {
        method: 'POST',
        body: payload,
        authHeader: getServiceAuthHeader(),
      },
    );

    return NextResponse.json(updated);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Failed to cancel order';
    return NextResponse.json(
      { error: message },
      { status: status >= 400 && status < 600 ? status : 500 },
    );
  }
}
