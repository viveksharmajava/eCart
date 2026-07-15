'use client';

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ProductGrid } from '@/components/product/product-grid';
import {
  amazonAtcButtonClasses,
  amazonAtcButtonInnerClasses,
} from '@/components/product/amazon-add-to-cart-button';
import { Button } from '@/components/ui/button';
import { ActiveFilterChips, ProductFiltersPanel } from '@/features/catalog/plp-filters';
import { ProductSortSelect } from '@/features/catalog/plp-sort';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import type { PageResponse } from '@/types/catalog';
import type { EnrichedListProduct } from '@/types/filters';
import { cn } from '@/lib/utils';

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
            ? params.get('q')!
            : 'All Products';

  const total = data?.pages[0]?.totalElements ?? products.length;
  const displayTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return (
    <div className="amazon-plp bg-white">
      <div className="container-store py-6 lg:py-8">
        <div className="flex flex-col gap-3 border-b border-[#d5d9d9] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="amazon-results-heading">
              {params.get('q') ? (
                <>
                  Results for <span className="font-normal">&quot;{displayTitle}&quot;</span>
                </>
              ) : (
                displayTitle
              )}
            </h1>
            <p className="amazon-results-count mt-1">
              {total} {total === 1 ? 'result' : 'results'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#d5d9d9] bg-white font-normal text-[#0f1111] shadow-none hover:bg-[#f7fafa] lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <ProductSortSelect />
          </div>
        </div>

        <ActiveFilterChips />

        <div className="mt-6 flex gap-6 lg:gap-8">
          <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
            <div className="sticky top-28 rounded border border-[#d5d9d9] bg-white p-4">
              <h2 className="mb-3 text-base font-bold text-[#0f1111]">Filters</h2>
              <ProductFiltersPanel />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {isError && (
              <p className="text-[#c10015]">
                Unable to load products. Ensure backend services are running.
              </p>
            )}
            <ProductGrid
              products={products}
              loading={isLoading}
              columns={5}
              variant="amazon"
            />
            <div ref={sentinelRef} className="h-4" aria-hidden />
            {isFetchingNextPage && (
              <p className="mt-6 text-center text-sm text-[#565959]">Loading more…</p>
            )}
            {hasNextPage && !isFetchingNextPage && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  className={cn(amazonAtcButtonClasses, 'mt-0 inline-block w-auto min-w-[10rem]')}
                  onClick={() => fetchNextPage()}
                >
                  <span className={cn(amazonAtcButtonInnerClasses, 'w-auto px-6')}>
                    Load more results
                  </span>
                </button>              </div>
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
            <div className="absolute inset-y-0 left-0 w-[min(320px,90vw)] overflow-y-auto bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0f1111]">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-normal text-[#007185]"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Done
                </Button>
              </div>
              <ProductFiltersPanel onApplied={() => setMobileFiltersOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPageClient() {
  return (
    <Suspense
      fallback={
        <div className="amazon-plp container-store py-12 text-[#565959]">Loading products…</div>
      }
    >
      <ProductListingContent />
    </Suspense>
  );
}
