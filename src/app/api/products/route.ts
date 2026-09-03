import { NextResponse } from 'next/server';
import { listProducts } from '@/features/catalog/listing.service';
import type { ProductFilters, ProductSortOption } from '@/types/filters';

function parseFilters(searchParams: URLSearchParams): ProductFilters {
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const minRating = searchParams.get('minRating');
  const sort = searchParams.get('sort') as ProductSortOption | null;
  const catalog = searchParams.get('catalog') ?? undefined;
  const catalogId = searchParams.get('catalogId') ?? catalog ?? undefined;

  return {
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    catalog: catalog ?? catalogId,
    catalogId,
    brand: searchParams.get('brand') ?? undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    sort: sort ?? undefined,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? 0);
  const size = Number(searchParams.get('size') ?? 20);
  const filters = parseFilters(searchParams);

  try {
    const result = await listProducts(filters, page, size);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load products';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
