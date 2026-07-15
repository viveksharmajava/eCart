import type { PricedProduct } from '@/utils/pricing';
import type { EnrichedListProduct } from '@/types/filters';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';
import { ProductCardSkeleton } from './product-card-skeleton';
type GridProduct = (PricedProduct | EnrichedListProduct) & { imageUrl?: string; rating?: number };

interface ProductGridProps {
  products: GridProduct[];
  loading?: boolean;
  columns?: 2 | 3 | 4 | 5;
  variant?: 'default' | 'amazon';
}

export function ProductGrid({ products, loading, columns = 4, variant = 'default' }: ProductGridProps) {
  const gridClass =
    columns === 2
      ? 'grid-cols-2'
      : columns === 3
        ? 'grid-cols-2 md:grid-cols-3'
        : columns === 5
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (loading) {
    return (
      <div className={cn('grid', variant === 'amazon' ? 'amazon-plp-grid' : 'gap-4 sm:gap-6', gridClass)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className={cn('py-12 text-center', variant === 'amazon' ? 'text-[#565959]' : 'text-muted-foreground')}>
        No products found.
      </p>
    );
  }
  return (
    <div className={cn('grid', variant === 'amazon' ? 'amazon-plp-grid' : 'gap-4 sm:gap-6', gridClass)}>
      {products
        .filter((product) => product.productId)
        .map((product, index) => (
        <ProductCard
          key={product.productId}
          product={product}
          imageUrl={product.imageUrl}
          priority={index < 4}
          variant={variant}
        />
      ))}
    </div>
  );
}
