import { ROUTES } from '@/constants';
import { slugify } from '@/lib/utils';

/** Product listing URL scoped to a catalog category (uses categoryId for API lookup). */
export function productsCategoryHref(categoryId: string, categoryName?: string): string {
  const params = new URLSearchParams();
  params.set('categoryId', categoryId);
  const label = categoryName?.trim() || categoryId;
  params.set('category', slugify(label) || categoryId);
  return `${ROUTES.products}?${params.toString()}`;
}

/** Product listing URL for a catalog (browse-all; slug is display-only). */
export function productsCatalogHref(catalogId: string, catalogName?: string): string {
  const params = new URLSearchParams();
  params.set('catalogId', catalogId);
  const label = catalogName?.trim() || catalogId;
  params.set('catalog', slugify(label) || catalogId);
  return `${ROUTES.products}?${params.toString()}`;
}
