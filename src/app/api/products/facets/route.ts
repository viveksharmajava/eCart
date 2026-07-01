import { NextResponse } from 'next/server';
import { listAllEnrichedForFacets } from '@/features/catalog/listing.service';
import { buildFacets } from '@/features/catalog/product-enrichment';
import type { ProductFilters } from '@/types/filters';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters: Pick<ProductFilters, 'q' | 'brand' | 'category' | 'categoryId'> = {
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    brand: searchParams.get('brand') ?? undefined,
  };

  try {
    const products = await listAllEnrichedForFacets(filters);
    return NextResponse.json(buildFacets(products));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load facets';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
