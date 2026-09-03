import { ROUTES } from '@/constants';
import { slugify } from '@/lib/utils';

/** Product listing URL scoped to a catalog category (uses categoryId for API lookup). */
export function productsCategoryHref(
  categoryId: string,
  categoryName?: string,
  catalogId?: string,
): string {
  const params = new URLSearchParams();
  params.set('categoryId', categoryId);
  const label = categoryName?.trim() || categoryId;
  params.set('category', slugify(label) || categoryId);
  if (catalogId) {
    // Use the real catalog id (e.g. CRICKET), not a slugified display name.
    params.set('catalog', catalogId);
  }
  return `${ROUTES.products}?${params.toString()}`;
}

/** Product listing URL for a catalog — `catalog` is the prodCatalogId (e.g. CRICKET). */
export function productsCatalogHref(catalogId: string): string {
  const params = new URLSearchParams();
  params.set('catalog', catalogId);
  return `${ROUTES.products}?${params.toString()}`;
}
