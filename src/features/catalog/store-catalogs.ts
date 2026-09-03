import { cache } from 'react';
import { findProdCatalogs, getStoreProdCatalogs } from '@/services/catalog.service';
import type { ProdCatalogSummary } from '@/types/catalog';

/**
 * Catalogs associated with the configured product store (default OFBIZ_STORE).
 * Shared by nav, home heroes, footer, and home catalog strip.
 * Enriches ProductStoreCatalog rows with catalog details (e.g. headerLogo).
 */
export const getStorefrontCatalogs = cache(async (): Promise<ProdCatalogSummary[]> => {
  try {
    const storeCatalogs = await getStoreProdCatalogs();
    if (storeCatalogs.length === 0) return [];

    const detailsPage = await findProdCatalogs({
      noConditionFind: true,
      page: 0,
      size: Math.max(50, storeCatalogs.length),
      sortField: 'catalogName',
      sortDirection: 'asc',
    }).catch(() => null);

    const byId = new Map(
      (detailsPage?.content ?? []).map((c) => [c.prodCatalogId, c] as const),
    );

    return storeCatalogs.map((catalog) => {
      const detail = byId.get(catalog.prodCatalogId);
      return {
        prodCatalogId: catalog.prodCatalogId,
        catalogName: catalog.catalogName ?? detail?.catalogName,
        headerLogo: detail?.headerLogo,
        useQuickAdd: detail?.useQuickAdd,
        isCartEnabled: detail?.isCartEnabled,
      };
    });
  } catch (error) {
    console.error('[catalogs] Failed to load store catalogs', error);
    return [];
  }
});
