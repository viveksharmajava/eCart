import { productsCategoryHref, productsCatalogHref } from '@/lib/category-links';
import { resolveCategoryImageUrl } from '@/lib/category-images';
import { getCatalogCategories } from '@/services/catalog.service';
import { pickBrowseCatalogCategories } from '@/features/catalog/catalog-categories';
import { getStorefrontCatalogs } from '@/features/catalog/store-catalogs';
import type { ProdCatalogCategory, ProdCatalogSummary } from '@/types/catalog';
import type { CatalogNavItem, NavCategoryItem } from '@/types/nav';
import { cache } from 'react';

function categoryHref(category: ProdCatalogCategory, catalog: ProdCatalogSummary): string {
  return productsCategoryHref(
    category.categoryId,
    category.categoryName,
    catalog.prodCatalogId,
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

export const getCatalogNav = cache(async (): Promise<CatalogNavItem[]> => {
  try {
    const catalogs = await getStorefrontCatalogs();
    if (catalogs.length === 0) return [];

    const items = await Promise.all(
      catalogs.map(async (catalog) => {
        const categories = await getCatalogCategories(catalog.prodCatalogId).catch(() => []);
        const navCategories = pickNavCategories(categories, catalog);
        const label = catalog.catalogName ?? catalog.prodCatalogId;
        return {
          prodCatalogId: catalog.prodCatalogId,
          label,
          href: productsCatalogHref(catalog.prodCatalogId),
          categories: navCategories,
        } satisfies CatalogNavItem;
      }),
    );

    return items;
  } catch (error) {
    console.error('[nav] Failed to load catalog navigation', error);
    return [];
  }
});
