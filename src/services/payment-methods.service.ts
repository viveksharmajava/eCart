import type { StorefrontPaymentMethod } from '@/types/store';
import { httpClient } from './http.client';

/** Enabled payment methods for the default storefront store (public). */
export async function getStorefrontPaymentMethods(): Promise<StorefrontPaymentMethod[]> {
  const rows = await httpClient<StorefrontPaymentMethod[]>('/catalog/storefront/payment-methods');
  return Array.isArray(rows) ? rows : [];
}
