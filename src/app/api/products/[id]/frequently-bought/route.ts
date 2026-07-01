import { NextResponse } from 'next/server';
import { findProducts } from '@/services/catalog.service';
import { enrichProducts } from '@/features/catalog/product-enrichment';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const productId = decodeURIComponent(id);
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? 4);

  try {
    const page = await findProducts({
      noConditionFind: true,
      page: 0,
      size: limit + 10,
      sortField: 'productId',
      sortDirection: 'asc',
    });
    const others = (page.content ?? []).filter((p) => p.productId !== productId);
    const bundle = others.slice(0, limit);
    const enriched = await enrichProducts(bundle);
    const total = enriched.reduce((sum, p) => sum + (p.salePrice ?? 0), 0);
    return NextResponse.json({ products: enriched, bundleTotal: total });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load bundle';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
