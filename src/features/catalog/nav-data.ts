import { productsCategoryHref, productsCatalogHref } from '@/lib/category-links';
import { resolveCategoryImageUrl } from '@/lib/category-images';
import { findCartEnabledProdCatalogs, getCatalogCategories } from '@/services/catalog.service';
import { getStorefrontSettings } from '@/features/store/storefront-settings';
import type { ProdCatalogCategory, ProdCatalogSummary } from '@/types/catalog';
import type { CatalogNavItem, NavCategoryItem } from '@/types/nav';
import { ROUTES, SPORT_NAV } from '@/constants';
import { cache } from 'react';

/** Catalog–category link types shown in storefront browse navigation. */
const NAV_CATALOG_CATEGORY_TYPES = new Set([
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

function categoryHref(category: ProdCatalogCategory): string {
  return productsCategoryHref(category.categoryId, category.categoryName);
}

function mapNavCategory(category: ProdCatalogCategory): NavCategoryItem {
  return {
    categoryId: category.categoryId,
    categoryName: category.categoryName ?? category.categoryId,
    imageUrl: resolveCategoryImageUrl(category.categoryId, category.categoryImageUrl),
    href: categoryHref(category),
  };
}

function pickNavCategories(categories: ProdCatalogCategory[]): NavCategoryItem[] {
  const sorted = [...categories].sort(
    (a, b) => (a.sequenceNum ?? 999) - (b.sequenceNum ?? 999),
  );

  let filtered = sorted.filter((c) =>
    NAV_CATALOG_CATEGORY_TYPES.has(c.prodCatalogCategoryTypeId),
  );
  if (filtered.length === 0) {
    filtered = sorted.filter((c) => !PROMO_CATALOG_CATEGORY_TYPES.has(c.prodCatalogCategoryTypeId));
  }
  if (filtered.length === 0) {
    filtered = sorted;
  }

  const seen = new Set<string>();
  const items: NavCategoryItem[] = [];
  for (const cat of filtered) {
    if (seen.has(cat.categoryId)) continue;
    seen.add(cat.categoryId);
    items.push(mapNavCategory(cat));
  }
  return items.slice(0, 8);
}

function fallbackNav(): CatalogNavItem[] {
  return SPORT_NAV.map((item) => ({
    prodCatalogId: item.label,
    label: item.label,
    href: item.href,
    categories: [],
  }));
}

export const getCatalogNav = cache(async (): Promise<CatalogNavItem[]> => {
  try {
    const [storeSettings, allCatalogs] = await Promise.all([
      getStorefrontSettings(),
      findCartEnabledProdCatalogs(24),
    ]);

    let catalogs: ProdCatalogSummary[] = allCatalogs;
    const allowedIds = storeSettings.catalogIds ?? [];
    if (allowedIds.length > 0) {
      const idSet = new Set(allowedIds);
      const filtered = allCatalogs.filter((c) => idSet.has(c.prodCatalogId));
      if (filtered.length > 0) {
        catalogs = allowedIds
          .map((id) => filtered.find((c) => c.prodCatalogId === id))
          .filter((c): c is ProdCatalogSummary => Boolean(c));
      }
    }

    if (catalogs.length === 0) return fallbackNav();

    const items = await Promise.all(
      catalogs.map(async (catalog) => {
        const categories = await getCatalogCategories(catalog.prodCatalogId).catch(() => []);
        const navCategories = pickNavCategories(categories);
        const label = catalog.catalogName ?? catalog.prodCatalogId;
        return {
          prodCatalogId: catalog.prodCatalogId,
          label,
          href: productsCatalogHref(catalog.prodCatalogId, label),
          categories: navCategories,
        } satisfies CatalogNavItem;
      }),
    );

    return items.length > 0 ? items : fallbackNav();
  } catch (error) {
    console.error('[nav] Failed to load catalog navigation', error);
    return fallbackNav();
  }
});
