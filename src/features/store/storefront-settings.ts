import { cache } from 'react';
import { getDefaultStorefrontSettings } from '@/services/store-settings.service';
import type { StorefrontSettings } from '@/types/store';
import { STORE_CONFIG } from '@/constants';

const FALLBACK: StorefrontSettings = {
  productStoreId: STORE_CONFIG.productStoreId,
  catalogIds: [STORE_CONFIG.defaultCatalogId],
};

export const getStorefrontSettings = cache(async (): Promise<StorefrontSettings> => {
  try {
    return await getDefaultStorefrontSettings();
  } catch (error) {
    console.error('[storefront] Failed to load default store settings', error);
    return FALLBACK;
  }
});
