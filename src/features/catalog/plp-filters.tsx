'use client';

import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { ProductFacets } from '@/types/filters';
import type { ProductFilters } from '@/types/filters';
import { useProductFilters } from '@/hooks/use-product-filters';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { formatCurrency, slugify } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

async function fetchFacets(queryString: string): Promise<ProductFacets> {
  const qs = queryString ? `?${queryString}` : '';
  const res = await fetch(`/api/products/facets${qs}`);
  if (!res.ok) throw new Error('Failed to load facets');
  return res.json();
}

interface ProductFiltersPanelProps {
  onApplied?: () => void;
}

export function ProductFiltersPanel({ onApplied }: ProductFiltersPanelProps) {
  const { filters, setFilters, clearFilters, activeCount, queryString } = useProductFilters();
  const { data: facets } = useQuery({
    queryKey: ['facets', queryString],
    queryFn: () => fetchFacets(queryString),
    staleTime: 5 * 60 * 1000,
  });

  const priceMin = facets?.priceRange.min ?? 0;
  const priceMax = facets?.priceRange.max ?? 10000;
  const catalogCategories = facets?.catalogCategories ?? [];
  const currentRange: [number, number] = [    filters.minPrice ?? priceMin,
    filters.maxPrice ?? priceMax,
  ];

  function apply(partial: Partial<ProductFilters>) {
    setFilters(partial);
    onApplied?.();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide">Filters</h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Price</h3>
        <Slider
          min={priceMin}
          max={priceMax}
          step={100}
          value={currentRange}
          onValueCommit={(value) =>
            apply({ minPrice: value[0], maxPrice: value[1] })
          }
          className="mb-3"
        />
        <p className="text-xs text-muted-foreground">
          {formatCurrency(currentRange[0])} – {formatCurrency(currentRange[1])}
        </p>
      </section>

      {catalogCategories.length > 0 && (
        <>
          <Separator />
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Categories
            </h3>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {catalogCategories.map((category) => (
                <label
                  key={category.value}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={filters.categoryId === category.value}
                    onCheckedChange={(checked) =>
                      apply({
                        categoryId: checked ? category.value : undefined,
                        category: checked
                          ? slugify(category.label) || category.value
                          : undefined,
                      })
                    }
                  />
                  <span className="flex-1">{category.label}</span>
                  <span className="text-xs text-muted-foreground">({category.count})</span>
                </label>
              ))}
            </div>
          </section>
        </>
      )}

      <Separator />

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Brand</h3>        <div className="max-h-40 space-y-2 overflow-y-auto">
          {(facets?.brands ?? []).map((brand) => (
            <label key={brand.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={filters.brand === brand.value}
                onCheckedChange={(checked) =>
                  apply({ brand: checked ? brand.value : undefined })
                }
              />
              <span className="flex-1">{brand.label}</span>
              <span className="text-xs text-muted-foreground">({brand.count})</span>
            </label>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Rating</h3>
        <div className="space-y-2">
          {(facets?.ratings ?? []).map((r) => (
            <label key={r.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={filters.minRating === r.value}
                onCheckedChange={(checked) =>
                  apply({ minRating: checked ? r.value : undefined })
                }
              />
              <span>{r.label}</span>
              <span className="text-xs text-muted-foreground">({r.count})</span>
            </label>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={filters.inStock ?? false}
            onCheckedChange={(checked) => apply({ inStock: checked === true })}
          />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={filters.onSale ?? false}
            onCheckedChange={(checked) => apply({ onSale: checked === true })}
          />
          On sale / discount
        </label>
      </section>
    </div>
  );
}

export function ActiveFilterChips() {
  const { filters, setFilters, clearAll } = useProductFilters();
  const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

  if (filters.q) chips.push({ key: 'q', label: `Search: ${filters.q}`, onRemove: () => setFilters({ q: undefined }) });
  if (filters.category || filters.categoryId) {
    chips.push({
      key: 'cat',
      label: (filters.category ?? filters.categoryId)!.replace(/-/g, ' '),
      onRemove: () => setFilters({ category: undefined, categoryId: undefined }),
    });
  }
  if (filters.catalog || filters.catalogId) {
    chips.push({
      key: 'catalog',
      label: (filters.catalog ?? filters.catalogId)!.replace(/-/g, ' '),
      onRemove: () =>
        setFilters({
          catalog: undefined,
          catalogId: undefined,
          category: undefined,
          categoryId: undefined,
        }),
    });
  }  if (filters.brand) chips.push({ key: 'brand', label: filters.brand, onRemove: () => setFilters({ brand: undefined }) });
  if (filters.minPrice != null || filters.maxPrice != null) {
    chips.push({
      key: 'price',
      label: `₹${filters.minPrice ?? 0}–₹${filters.maxPrice ?? '∞'}`,
      onRemove: () => setFilters({ minPrice: undefined, maxPrice: undefined }),
    });
  }
  if (filters.minRating) chips.push({ key: 'rating', label: `${filters.minRating}★+`, onRemove: () => setFilters({ minRating: undefined }) });
  if (filters.inStock) chips.push({ key: 'stock', label: 'In stock', onRemove: () => setFilters({ inStock: false }) });
  if (filters.onSale) chips.push({ key: 'sale', label: 'On sale', onRemove: () => setFilters({ onSale: false }) });

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 rounded-full border bg-secondary px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={clearAll}>
        Clear all
      </Button>
    </div>
  );
}
