'use client';

import { useProductFilters } from '@/hooks/use-product-filters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProductSortOption } from '@/types/filters';

export function ProductSortSelect() {
  const { filters, setFilters, sortOptions } = useProductFilters();

  return (
    <Select
      value={filters.sort ?? 'relevance'}
      onValueChange={(value) => setFilters({ sort: value as ProductSortOption })}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
