import { NextResponse } from 'next/server';
import { loadBrowseCatalogCategories } from '@/features/catalog/catalog-categories';
import { listAllEnrichedForFacets } from '@/features/catalog/listing.service';
import { buildFacets } from '@/features/catalog/product-enrichment';
import { getCategoryProducts } from '@/services/catalog.service';
import type { ProductFilters } from '@/types/filters';

async function buildCatalogCategoryFacets(catalogId: string) {
  const categories = await loadBrowseCatalogCategories(catalogId);
  const catalogCategories = await Promise.all(
    categories.map(async (category) => {
      const products = await getCategoryProducts(category.categoryId).catch(() => []);
      return {
        value: category.categoryId,
        label: category.categoryName ?? category.categoryId,
        count: products.length,
      };
    }),
  );
  return catalogCategories;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const catalogId = searchParams.get('catalogId') ?? undefined;
  const filters: Pick<ProductFilters, 'q' | 'brand' | 'category' | 'categoryId' | 'catalogId'> = {
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    catalogId,
    brand: searchParams.get('brand') ?? undefined,
  };

  try {
    const products = await listAllEnrichedForFacets(filters);
    const facets = buildFacets(products);

    if (catalogId) {
      facets.catalogCategories = await buildCatalogCategoryFacets(catalogId);
    }

    return NextResponse.json(facets);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load facets';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
