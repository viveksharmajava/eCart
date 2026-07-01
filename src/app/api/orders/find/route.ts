import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { httpClient } from '@/services/http.client';
import { getServiceAuthHeader, parseSessionCookie, SESSION_COOKIE } from '@/lib/session';
import type { OrderSummary } from '@/types/commerce';

interface OrderPage {
  content: OrderSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = parseSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
    if (!session?.partyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const page = await httpClient<OrderPage>('/orders/find', {
      method: 'POST',
      body: {
        partyId: session.partyId,
        partyIdMatch: 'EQUALS',
        page: body.page ?? 0,
        size: body.size ?? 20,
      },
      authHeader: getServiceAuthHeader(),
    });

    return NextResponse.json(page);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load orders';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
