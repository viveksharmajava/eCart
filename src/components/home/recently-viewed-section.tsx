'use client';

import { ProductGrid } from '@/components/product/product-grid';
import { useRecentlyViewedStore } from '@/store/recently-viewed.store';
import { SectionHeading } from '@/components/home/section-heading';
import { ROUTES } from '@/constants';

export function RecentlyViewedSection() {
  const items = useRecentlyViewedStore((s) => s.items);

  if (items.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-12 lg:py-16">
      <div className="container-store">
        <SectionHeading title="Recently Viewed" href={ROUTES.products} />
        <ProductGrid
          products={items.map((p) => ({
            ...p,
            imageUrl: p.imageUrl,
          }))}
          columns={4}
        />
      </div>
    </section>
  );
}
