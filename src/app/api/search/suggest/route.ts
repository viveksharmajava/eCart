import { NextResponse } from 'next/server';
import { searchProducts } from '@/services/catalog.service';
import type { SearchSuggestion } from '@/types/filters';
import { enrichProducts, suggestionFromProduct } from '@/features/catalog/product-enrichment';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const [bySearch, enrichedAll] = await Promise.all([
      searchProducts(q).catch(() => []),
      (async () => {
        const { findProducts } = await import('@/services/catalog.service');
        const page = await findProducts({
          noConditionFind: false,
          page: 0,
          size: 10,
          productName: { value: q, operator: 'contains', ignoreCase: true },
        });
        return enrichProducts(page.content ?? []);
      })(),
    ]);

    const map = new Map<string, SearchSuggestion>();
    const fromSearch = await enrichProducts(bySearch.slice(0, 6));
    [...fromSearch, ...enrichedAll].forEach((p) => {
      if (!map.has(p.productId)) map.set(p.productId, suggestionFromProduct(p));
    });

    const suggestions: SearchSuggestion[] = [...map.values()].slice(0, 8);
    if (suggestions.length < 8 && !map.has(q.toLowerCase())) {
      suggestions.push({ type: 'keyword', label: q });
    }

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [{ type: 'keyword', label: q }] });
  }
}
