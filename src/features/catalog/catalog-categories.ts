import { getCatalogCategories } from '@/services/catalog.service';
import type { ProdCatalogCategory } from '@/types/catalog';

/** Catalog–category link types shown in storefront browse navigation and filters. */
export const BROWSE_CATALOG_CATEGORY_TYPES = new Set([
  'PCCT_BROWSE_ROOT',
  'PCCT_OTHER_SEARCH',
  'PCCT_QUICK_ADD',
]);

const PROMO_CATALOG_CATEGORY_TYPES = new Set([
  'PCCT_MOST_POPULAR',
  'PCCT_WHATS_NEW',
  'PCCT_PROMOTIONS',
  'PCCT_SEARCH',
]);

export function pickBrowseCatalogCategories(
  categories: ProdCatalogCategory[],
  limit?: number,
): ProdCatalogCategory[] {
  const sorted = [...categories].sort(
    (a, b) => (a.sequenceNum ?? 999) - (b.sequenceNum ?? 999),
  );

  let filtered = sorted.filter((c) =>
    BROWSE_CATALOG_CATEGORY_TYPES.has(c.prodCatalogCategoryTypeId),
  );
  if (filtered.length === 0) {
    filtered = sorted.filter((c) => !PROMO_CATALOG_CATEGORY_TYPES.has(c.prodCatalogCategoryTypeId));
  }
  if (filtered.length === 0) {
    filtered = sorted;
  }

  const seen = new Set<string>();
  const items: ProdCatalogCategory[] = [];
  for (const cat of filtered) {
    if (seen.has(cat.categoryId)) continue;
    seen.add(cat.categoryId);
    items.push(cat);
  }

  return limit != null ? items.slice(0, limit) : items;
}

export async function loadBrowseCatalogCategories(
  catalogId: string,
): Promise<ProdCatalogCategory[]> {
  const categories = await getCatalogCategories(catalogId).catch(() => []);
  return pickBrowseCatalogCategories(categories);
}
