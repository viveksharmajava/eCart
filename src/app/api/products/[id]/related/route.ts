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
  const limit = Number(searchParams.get('limit') ?? 8);

  try {
    const source = await findProducts({
      noConditionFind: false,
      page: 0,
      size: 1,
      productId: { value: productId, operator: 'equals', ignoreCase: true },
    });
    const current = source.content?.[0];
    if (!current) {
      return NextResponse.json({ products: [] });
    }

    const relatedQuery = current.brandName ?? current.productName ?? productId;
    const page = await findProducts({
      noConditionFind: false,
      page: 0,
      size: limit + 5,
      brandName: relatedQuery
        ? { value: relatedQuery.split(' ')[0] ?? relatedQuery, operator: 'contains', ignoreCase: true }
        : undefined,
    });

    const candidates = (page.content ?? []).filter((p) => p.productId !== productId);
    const enriched = await enrichProducts(candidates.slice(0, limit));
    return NextResponse.json({ products: enriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load related products';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
