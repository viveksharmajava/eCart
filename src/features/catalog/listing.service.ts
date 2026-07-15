import { findProducts, getCategoryProducts } from '@/services/catalog.service';
import { loadBrowseCatalogCategories } from '@/features/catalog/catalog-categories';
import type { ProductSummary } from '@/types/catalog';
import type { ProductFilters } from '@/types/filters';
import {
  enrichProducts,
  filterProducts,
  sortProducts,
} from './product-enrichment';

const CATALOG_FETCH_SIZE = 200;

async function fetchCatalogProducts(catalogId: string): Promise<ProductSummary[]> {
  const categories = await loadBrowseCatalogCategories(catalogId);
  if (categories.length === 0) return [];

  const map = new Map<string, ProductSummary>();
  for (const category of categories) {
    const products = await getCategoryProducts(category.categoryId).catch(() => []);
    for (const product of products) {
      map.set(product.productId, product);
    }
  }
  return [...map.values()];
}

async function fetchBaseProducts(filters: ProductFilters): Promise<ProductSummary[]> {
  const { q, brand, category, categoryId, catalogId } = filters;

  if (categoryId) {
    return getCategoryProducts(categoryId);
  }

  if (catalogId) {
    return fetchCatalogProducts(catalogId);
  }
  if (q) {
    const page = await findProducts({
      noConditionFind: false,
      page: 0,
      size: CATALOG_FETCH_SIZE,
      productName: { value: q, operator: 'contains', ignoreCase: true },
    });
    const byId = await findProducts({
      noConditionFind: false,
      page: 0,
      size: CATALOG_FETCH_SIZE,
      productId: { value: q, operator: 'contains', ignoreCase: true },
    });
    const map = new Map<string, ProductSummary>();
    [...(page.content ?? []), ...(byId.content ?? [])].forEach((p) => map.set(p.productId, p));
    return [...map.values()];
  }

  if (brand) {
    const page = await findProducts({
      noConditionFind: false,
      page: 0,
      size: CATALOG_FETCH_SIZE,
      brandName: { value: brand, operator: 'contains', ignoreCase: true },
    });
    return page.content ?? [];
  }

  if (category) {
    const term = category.replace(/-/g, ' ');
    const page = await findProducts({
      noConditionFind: false,
      page: 0,
      size: CATALOG_FETCH_SIZE,
      internalName: { value: term, operator: 'contains', ignoreCase: true },
    });
    const byName = await findProducts({
      noConditionFind: false,
      page: 0,
      size: CATALOG_FETCH_SIZE,
      productName: { value: term, operator: 'contains', ignoreCase: true },
    });
    const map = new Map<string, ProductSummary>();
    [...(page.content ?? []), ...(byName.content ?? [])].forEach((p) => map.set(p.productId, p));
    return [...map.values()];
  }

  const page = await findProducts({
    noConditionFind: true,
    page: 0,
    size: CATALOG_FETCH_SIZE,
    sortField: 'productId',
    sortDirection: 'asc',
  });
  return page.content ?? [];
}

export async function listProducts(filters: ProductFilters, page = 0, size = 20) {
  const base = await fetchBaseProducts(filters);
  const enriched = await enrichProducts(base);
  const filtered = filterProducts(enriched, {
    q: filters.q,
    brand: filters.brand,
    category: filters.categoryId ? undefined : filters.category,
    categoryId: filters.categoryId,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    inStock: filters.inStock,
    onSale: filters.onSale,
  });
  const sorted = sortProducts(filtered, filters.sort ?? 'relevance');
  const totalElements = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const content = sorted.slice(page * size, page * size + size);

  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
  };
}

export async function listAllEnrichedForFacets(
  filters: Pick<ProductFilters, 'q' | 'brand' | 'category' | 'categoryId' | 'catalogId'>,
) {
  const base = await fetchBaseProducts(filters);
  return enrichProducts(base);
}