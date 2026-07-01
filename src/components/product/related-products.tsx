'use client';

import { useQuery } from '@tanstack/react-query';
import { SectionHeading } from '@/components/home/section-heading';
import { ProductGrid } from '@/components/product/product-grid';
import { ROUTES } from '@/constants';
import type { EnrichedListProduct } from '@/types/filters';

interface RelatedProductsProps {
  productId: string;
  title?: string;
}

async function fetchRelated(productId: string): Promise<EnrichedListProduct[]> {
  const res = await fetch(`/api/products/${encodeURIComponent(productId)}/related`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.products ?? [];
}

export function RelatedProducts({ productId, title = 'Related Products' }: RelatedProductsProps) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['related', productId],
    queryFn: () => fetchRelated(productId),
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-16 border-t pt-12">
      <SectionHeading title={title} href={ROUTES.products} />
      <ProductGrid products={products} loading={isLoading} columns={4} />
    </section>
  );
}
