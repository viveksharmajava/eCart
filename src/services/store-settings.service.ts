import type { StorefrontSettings } from '@/types/store';
import { httpClient } from './http.client';

/** Default store page content from catalog service (public endpoint). */
export async function getDefaultStorefrontSettings(): Promise<StorefrontSettings> {
  return httpClient<StorefrontSettings>('/catalog/storefront/settings');
}
