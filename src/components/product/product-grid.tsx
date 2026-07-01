import type { PricedProduct } from '@/utils/pricing';
import type { EnrichedListProduct } from '@/types/filters';
import { ProductCard } from './product-card';
import { ProductCardSkeleton } from './product-card-skeleton';

type GridProduct = (PricedProduct | EnrichedListProduct) & { imageUrl?: string; rating?: number };

interface ProductGridProps {
  products: GridProduct[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, loading, columns = 4 }: ProductGridProps) {
  const gridClass =
    columns === 2
      ? 'grid-cols-2'
      : columns === 3
        ? 'grid-cols-2 md:grid-cols-3'
        : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (loading) {
    return (
      <div className={`grid gap-4 sm:gap-6 ${gridClass}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">No products found.</p>
    );
  }

  return (
    <div className={`grid gap-4 sm:gap-6 ${gridClass}`}>
      {products
        .filter((product) => product.productId)
        .map((product, index) => (
        <ProductCard
          key={product.productId}
          product={product}
          imageUrl={product.imageUrl}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
