'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import type { PricedProduct } from '@/utils/pricing';
import type { EnrichedListProduct } from '@/types/filters';
import { ROUTES } from '@/constants';
import { productSlug } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { Button } from '@/components/ui/button';
import { ProductPriceDisplay } from '@/components/product/product-price-display';
import { cn } from '@/lib/utils';

type CardProduct = (PricedProduct | EnrichedListProduct) & { imageUrl?: string; rating?: number };

interface ProductCardProps {
  product: CardProduct;
  imageUrl?: string;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, imageUrl, className, priority }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.productId ?? ''));
  if (!product.productId) return null;
  const slug = productSlug(product.productId, product.productName ?? product.internalName);
  const displayName = product.productName ?? product.internalName ?? product.productId;

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <Link href={ROUTES.product(slug)} className="block overflow-hidden rounded-lg bg-secondary">
        <div className="relative aspect-[4/5] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
              No image
            </div>
          )}
          {(product.discountPercent ?? 0) > 0 && (
            <span className="absolute left-2 top-2 rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
              {product.discountPercent}% OFF
            </span>
          )}
          <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow"
              onClick={(e) => {
                e.preventDefault();
                toggle(product);
              }}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={cn(inWishlist && 'fill-accent text-accent')} />
            </Button>
          </div>
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        {product.brandName && (
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {product.brandName}
          </p>
        )}
        <Link href={ROUTES.product(slug)}>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug hover:underline">
            {displayName}
          </h3>
        </Link>
        {'rating' in product && product.rating != null && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <ProductPriceDisplay
            salePrice={product.salePrice}
            listPrice={product.listPrice}
            currency={product.currency}
            discountPercent={product.discountPercent}
            size="sm"
            showOffer={false}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={() =>
              addItem({
                productId: product.productId,
                productName: displayName,
                brandName: product.brandName,
                imageUrl,
                quantity: 1,
                unitPrice: product.salePrice ?? product.listPrice ?? 0,
                listPrice: product.listPrice,
                currency: product.currency,
              })
            }
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
