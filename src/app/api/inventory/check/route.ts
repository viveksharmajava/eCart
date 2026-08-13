import { NextResponse } from 'next/server';
import { STORE_CONFIG } from '@/constants';
import { httpClient } from '@/services/http.client';
import type { ProductInventorySummary } from '@/services/facility.service';

interface CheckBody {
  items?: Array<{ productId: string; quantity: number }>;
  productStoreId?: string;
}

export interface UnavailableCartItem {
  productId: string;
  requested: number;
  availableToPromise: number;
}

function facilityAuth(): string {
  return process.env.FACILITY_SERVICE_AUTH_HEADER ?? 'admin:ADMIN,FULLADMIN';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckBody;
    const items = (body.items ?? []).filter(
      (item) => item?.productId && Number(item.quantity) > 0,
    );

    if (items.length === 0) {
      return NextResponse.json({ unavailable: [] as UnavailableCartItem[] });
    }

    const productStoreId = body.productStoreId || STORE_CONFIG.productStoreId;
    const productIds = [...new Set(items.map((item) => item.productId))];

    const summaries = await httpClient<ProductInventorySummary[]>('/facility/inventory/summaries', {
      method: 'POST',
      body: { productStoreId, productIds },
      authHeader: facilityAuth(),
    });

    const summaryByProduct = new Map<string, ProductInventorySummary>();
    for (const row of summaries ?? []) {
      if (row.productId) summaryByProduct.set(row.productId, row);
    }

    const requestedByProduct = new Map<string, number>();
    for (const item of items) {
      requestedByProduct.set(
        item.productId,
        (requestedByProduct.get(item.productId) ?? 0) + Number(item.quantity),
      );
    }

    const unavailable: UnavailableCartItem[] = [];
    for (const [productId, requested] of requestedByProduct) {
      const summary = summaryByProduct.get(productId);
      const atp = Number(summary?.availableToPromise ?? 0);
      if (!Number.isFinite(atp) || atp < requested) {
        unavailable.push({
          productId,
          requested,
          availableToPromise: Number.isFinite(atp) ? atp : 0,
        });
      }
    }

    return NextResponse.json({ unavailable });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Inventory check failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
