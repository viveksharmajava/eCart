'use client';

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { SectionHeading } from '@/components/home/section-heading';
import { ProductGrid } from '@/components/product/product-grid';
import { Button } from '@/components/ui/button';
import { ActiveFilterChips, ProductFiltersPanel } from '@/features/catalog/plp-filters';
import { ProductSortSelect } from '@/features/catalog/plp-sort';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import type { PageResponse } from '@/types/catalog';
import type { EnrichedListProduct } from '@/types/filters';

type PricedPage = PageResponse<EnrichedListProduct>;

async function fetchProductsPage(page: number, queryString: string): Promise<PricedPage> {
  const qs = new URLSearchParams(queryString);
  qs.set('page', String(page));
  qs.set('size', '20');
  const res = await fetch(`/api/products?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

function ProductListingContent() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ['products', queryString],
      queryFn: ({ pageParam = 0 }) => fetchProductsPage(pageParam, queryString),
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
      initialPageParam: 0,
    });

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useInfiniteScroll(loadMore, Boolean(hasNextPage));

  const products = data?.pages.flatMap((p) => p.content) ?? [];
  const params = new URLSearchParams(queryString);
  const title = params.get('category')
    ? params.get('category')!.replace(/-/g, ' ')
    : params.get('categoryId')
      ? params.get('categoryId')!
      : params.get('catalog')
        ? params.get('catalog')!.replace(/-/g, ' ')
        : params.get('brand')
      ? params.get('brand')!
      : params.get('q')
        ? `Search: ${params.get('q')}`
        : 'All Products';

  return (
    <div className="container-store py-8 lg:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          title={title.charAt(0).toUpperCase() + title.slice(1)}
          subtitle={`${data?.pages[0]?.totalElements ?? products.length} products`}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          <ProductSortSelect />
        </div>
      </div>

      <ActiveFilterChips />

      <div className="flex gap-10">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 rounded-lg border p-5">
            <ProductFiltersPanel />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {isError && (
            <p className="text-destructive">
              Unable to load products. Ensure backend services are running.
            </p>
          )}
          <ProductGrid products={products} loading={isLoading} />
          <div ref={sentinelRef} className="h-4" aria-hidden />
          {isFetchingNextPage && (
            <p className="mt-6 text-center text-sm text-muted-foreground">Loading more…</p>
          )}
          {hasNextPage && !isFetchingNextPage && (
            <div className="mt-10 text-center">
              <Button variant="outline" size="lg" onClick={() => fetchNextPage()}>
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-[min(320px,90vw)] overflow-y-auto bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold uppercase">Filters</h2>
              <Button variant="ghost" size="sm" onClick={() => setMobileFiltersOpen(false)}>
                Done
              </Button>
            </div>
            <ProductFiltersPanel onApplied={() => setMobileFiltersOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPageClient() {
  return (
    <Suspense fallback={<div className="container-store py-12">Loading products…</div>}>
      <ProductListingContent />
    </Suspense>
  );
}
