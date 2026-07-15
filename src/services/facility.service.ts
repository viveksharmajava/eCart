import { STORE_CONFIG } from '@/constants';
import { getServiceAuthHeader, httpClient } from './http.client';

export interface ProductInventorySummary {
  productId: string;
  productStoreId?: string;
  quantityOnHand?: number;
  quantityReserved?: number;
  availableToPromise?: number;
  totalInventory?: number;
}

function facilityAuth(): string {
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.FACILITY_SERVICE_AUTH_HEADER ?? 'admin:ADMIN,FULLADMIN';
}

export async function getProductInventory(
  productId: string,
  productStoreId: string = STORE_CONFIG.productStoreId,
): Promise<ProductInventorySummary | null> {
  try {
    const params = new URLSearchParams({ productStoreId });
    const detail = await httpClient<{ summary?: ProductInventorySummary }>(
      `/facility/inventory/products/${encodeURIComponent(productId)}?${params.toString()}`,
      { authHeader: facilityAuth() },
    );
    return detail?.summary ?? null;
  } catch {
    return null;
  }
}

export async function getInventorySummaries(
  productIds: string[],
  productStoreId: string = STORE_CONFIG.productStoreId,
): Promise<Map<string, ProductInventorySummary>> {
  const map = new Map<string, ProductInventorySummary>();
  if (productIds.length === 0) return map;

  try {
    const summaries = await httpClient<ProductInventorySummary[]>('/facility/inventory/summaries', {
      method: 'POST',
      body: { productStoreId, productIds },
      authHeader: facilityAuth(),
    });
    for (const row of summaries ?? []) {
      if (row.productId) map.set(row.productId, row);
    }
  } catch {
    // Inventory optional — callers fall back to catalog status
  }
  return map;
}
