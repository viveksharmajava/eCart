'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ProductFilters, ProductSortOption } from '@/types/filters';
import { ROUTES } from '@/constants';

const SORT_OPTIONS: Array<{ value: ProductSortOption; label: string }> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'discount', label: 'Discount' },
  { value: 'newest', label: 'Newest' },
  { value: 'name_asc', label: 'Name: A–Z' },
];

function parseFiltersFromParams(params: URLSearchParams): ProductFilters {
  const catalog = params.get('catalog') ?? undefined;
  const catalogId = params.get('catalogId') ?? catalog ?? undefined;
  return {
    q: params.get('q') ?? undefined,
    category: params.get('category') ?? undefined,
    categoryId: params.get('categoryId') ?? undefined,
    catalog: catalog ?? catalogId,
    catalogId,
    brand: params.get('brand') ?? undefined,
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
    inStock: params.get('inStock') === 'true',
    onSale: params.get('onSale') === 'true',
    sort: (params.get('sort') as ProductSortOption) ?? undefined,
  };
}

function filtersToParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  // Prefer a single `catalog` query param using the real catalog id.
  const catalogId = filters.catalogId ?? filters.catalog;
  if (catalogId) params.set('catalog', catalogId);
  if (filters.brand) params.set('brand', filters.brand);
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.minRating != null) params.set('minRating', String(filters.minRating));
  if (filters.inStock) params.set('inStock', 'true');
  if (filters.onSale) params.set('onSale', 'true');
  if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort);
  return params;
}

export function useProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams],
  );

  const setFilters = useCallback(
    (next: Partial<ProductFilters>) => {
      const merged = { ...filters, ...next };
      const params = filtersToParams(merged);
      const qs = params.toString();
      router.push(qs ? `${ROUTES.products}?${qs}` : ROUTES.products, { scroll: false });
    },
    [filters, router],
  );

  const clearFilters = useCallback(() => {
    const keep: ProductFilters = {};
    if (filters.q) keep.q = filters.q;
    if (filters.category) keep.category = filters.category;
    if (filters.categoryId) keep.categoryId = filters.categoryId;
    if (filters.catalog) keep.catalog = filters.catalog;
    if (filters.catalogId) keep.catalogId = filters.catalogId;
    const params = filtersToParams(keep);
    const qs = params.toString();
    router.push(qs ? `${ROUTES.products}?${qs}` : ROUTES.products, { scroll: false });
  }, [filters, router]);

  const clearAll = useCallback(() => {
    router.push(ROUTES.products, { scroll: false });
  }, [router]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.brand) n++;
    if (filters.minPrice != null) n++;
    if (filters.maxPrice != null) n++;
    if (filters.minRating != null) n++;
    if (filters.inStock) n++;
    if (filters.onSale) n++;
    if (filters.categoryId) n++;
    return n;  }, [filters]);

  return {
    filters,
    setFilters,
    clearFilters,
    clearAll,
    activeCount,
    sortOptions: SORT_OPTIONS,
    queryString: searchParams.toString(),
  };
}
