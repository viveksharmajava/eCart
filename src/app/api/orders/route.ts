import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { httpClient } from '@/services/http.client';
import { cartToOrderPayload, guestPartyId } from '@/lib/commerce';
import { getServiceAuthHeader, parseSessionCookie, SESSION_COOKIE } from '@/lib/session';
import type { CartItem } from '@/types/commerce';
import type { OrderSummary } from '@/types/commerce';

interface CreateOrderBody {
  items: CartItem[];
  partyId?: string;
  guestEmail?: string;
  guestFirstName?: string;
  guestLastName?: string;
  orderName?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderBody;
    if (!body.items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const session = parseSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);

    let partyId = session?.partyId || body.partyId;
    if (!partyId) {
      if (!body.guestEmail?.trim()) {
        return NextResponse.json({ error: 'Email is required for guest checkout' }, { status: 400 });
      }
      partyId = guestPartyId(body.guestEmail);
    }

    const payload = cartToOrderPayload(
      body.items,
      partyId,
      body.orderName ??
        (body.guestFirstName
          ? `Order for ${body.guestFirstName} ${body.guestLastName ?? ''}`.trim()
          : session?.firstName
            ? `Order for ${session.firstName}`
            : undefined),
    );

    const order = await httpClient<OrderSummary>('/orders', {
      method: 'POST',
      body: payload,
      authHeader: getServiceAuthHeader(),
    });

    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
