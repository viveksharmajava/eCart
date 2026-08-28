import { productsCategoryHref, productsCatalogHref } from '@/lib/category-links';
import { resolveCategoryImageUrl } from '@/lib/category-images';
import { findCartEnabledProdCatalogs, getCatalogCategories } from '@/services/catalog.service';
import { pickBrowseCatalogCategories } from '@/features/catalog/catalog-categories';
import { getStorefrontSettings } from '@/features/store/storefront-settings';
import type { ProdCatalogCategory, ProdCatalogSummary } from '@/types/catalog';
import type { CatalogNavItem, NavCategoryItem } from '@/types/nav';
import { SPORT_NAV } from '@/constants';
import { cache } from 'react';

function categoryHref(category: ProdCatalogCategory, catalog: ProdCatalogSummary): string {
  return productsCategoryHref(
    category.categoryId,
    category.categoryName,
    catalog.prodCatalogId,
    catalog.catalogName,
  );
}

function mapNavCategory(
  category: ProdCatalogCategory,
  catalog: ProdCatalogSummary,
): NavCategoryItem {
  return {
    categoryId: category.categoryId,
    categoryName: category.categoryName ?? category.categoryId,
    imageUrl: resolveCategoryImageUrl(category.categoryId, category.categoryImageUrl),
    href: categoryHref(category, catalog),
  };
}

function pickNavCategories(
  categories: ProdCatalogCategory[],
  catalog: ProdCatalogSummary,
): NavCategoryItem[] {
  return pickBrowseCatalogCategories(categories, 8).map((c) => mapNavCategory(c, catalog));
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
        const navCategories = pickNavCategories(categories, catalog);
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
