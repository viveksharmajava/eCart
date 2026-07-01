'use client';

import { useShallow } from 'zustand/react/shallow';
import { useRecentlyViewedStore } from '@/store/recently-viewed.store';
import { SectionHeading } from '@/components/home/section-heading';
import { ProductGrid } from '@/components/product/product-grid';
import { ROUTES } from '@/constants';

interface ProductRecommendationsProps {
  excludeProductId: string;
}

export function ProductRecommendations({ excludeProductId }: ProductRecommendationsProps) {
  const items = useRecentlyViewedStore(
    useShallow((s) =>
      s.items.filter((p) => p.productId !== excludeProductId).slice(0, 4),
    ),
  );

  if (items.length === 0) return null;

  return (
    <section className="mt-16 border-t pt-12">
      <SectionHeading title="Recommended For You" subtitle="Based on your browsing" href={ROUTES.products} />
      <ProductGrid products={items.map((p) => ({ ...p, imageUrl: p.imageUrl }))} columns={4} />
    </section>
  );
}
