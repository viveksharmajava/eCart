import type { ProductPrice } from '@/types/pricing';
import { getServiceAuthHeader, httpClient } from './http.client';

export async function getProductPrices(productId: string): Promise<ProductPrice[]> {
  return httpClient(`/pricing/products/${encodeURIComponent(productId)}/prices`, {
    authHeader: getServiceAuthHeader(),
  });
}
