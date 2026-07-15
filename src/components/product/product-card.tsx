'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { PricedProduct } from '@/utils/pricing';
import type { EnrichedListProduct } from '@/types/filters';
import { ROUTES } from '@/constants';
import { productSlug } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';
import { canPurchase } from '@/features/catalog/product-enrichment';
import { AmazonAddToCartButton } from '@/components/product/amazon-add-to-cart-button';
import { AmazonWishlistButton } from '@/components/product/amazon-wishlist-button';
import { AmazonMrpRow, AmazonPriceDisplay } from '@/components/product/amazon-price-display';
import { cn } from '@/lib/utils';

type CardProduct = (PricedProduct | EnrichedListProduct) & {
  imageUrl?: string;
  availableToPromise?: number;
};

interface ProductCardProps {
  product: CardProduct;
  imageUrl?: string;
  className?: string;
  priority?: boolean;
  /** Amazon.in-style card for the products listing page */
  variant?: 'default' | 'amazon';
}

function resolveDiscountPercent(
  salePrice?: number,
  listPrice?: number,
  discountPercent?: number,
): number | undefined {
  if (discountPercent != null && discountPercent > 0) return discountPercent;
  if (listPrice != null && salePrice != null && listPrice > salePrice) {
    return Math.round(((listPrice - salePrice) / listPrice) * 100);
  }
  return undefined;
}

export function ProductCard({
  product,
  imageUrl,
  className,
  priority,
  variant = 'default',
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  if (!product.productId) return null;

  const slug = productSlug(product.productId, product.productName ?? product.internalName);
  const displayName = product.productName ?? product.internalName ?? product.productId;
  const brandName = product.brandName?.trim();
  const brandMatchesName =
    brandName != null && brandName.toLowerCase() === displayName.trim().toLowerCase();
  const showBrand = Boolean(brandName) && !brandMatchesName;
  const showProductName = !brandName || brandMatchesName;
  const sellingPrice = product.salePrice ?? product.listPrice;
  const mrp = product.listPrice;
  const showMrp = mrp != null && sellingPrice != null && mrp > sellingPrice;
  const discount = resolveDiscountPercent(product.salePrice, product.listPrice, product.discountPercent);
  const purchasable = canPurchase(product, product.availableToPromise);

  function handleAddToCart() {
    addItem({
      productId: product.productId,
      productName: displayName,
      brandName: product.brandName,
      imageUrl,
      quantity: 1,
      unitPrice: product.salePrice ?? product.listPrice ?? 0,
      listPrice: product.listPrice,
      currency: product.currency,
    });
  }

  const wishlistOnImage = (
    <div className="absolute right-2 top-2 z-10">
      <AmazonWishlistButton
        product={product}
        imageUrl={imageUrl}
        iconOnly
        className="shadow-sm"
      />
    </div>
  );

  if (variant === 'amazon') {
    return (
      <article className={cn('amazon-product-card group relative', className)}>
        <div className="relative">
          <Link href={ROUTES.product(slug)} className="amazon-product-card__image-wrap block">
            <div className="amazon-product-card__image">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={displayName}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  priority={priority}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-[#565959]">
                  No image
                </div>
              )}
            </div>
          </Link>
          {wishlistOnImage}
        </div>

        <div className="amazon-product-card__body">
          {showBrand && (
            <p className="amazon-product-card__brand">{brandName}</p>
          )}

          {showProductName && (
            <Link href={ROUTES.product(slug)} className="amazon-product-card__title">
              {displayName}
            </Link>
          )}

          {sellingPrice != null ? (
            <AmazonPriceDisplay amount={sellingPrice} currency={product.currency} />
          ) : (
            <p className="text-sm text-[#565959]">Price on request</p>
          )}

          {showMrp && mrp != null && (
            <AmazonMrpRow mrp={mrp} currency={product.currency} discountPercent={discount} />
          )}

          <AmazonAddToCartButton
            onClick={handleAddToCart}
            disabled={!purchasable}
            className="mt-2.5"
          />
        </div>
      </article>
    );
  }

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <div className="relative">
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
          </div>
        </Link>
        {wishlistOnImage}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        {showBrand && (
          <p className="text-sm font-bold leading-snug">{brandName}</p>
        )}

        {showProductName && (
          <Link
            href={ROUTES.product(slug)}
            className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
          >
            {displayName}
          </Link>
        )}

        {sellingPrice != null ? (
          <p className="text-sm font-semibold">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: product.currency ?? 'INR',
            }).format(sellingPrice)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Price on request</p>
        )}

        {showMrp && mrp != null && (
          <p className="text-sm text-muted-foreground">
            MRP{' '}
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: product.currency ?? 'INR',
            }).format(mrp)}
            {discount != null && discount > 0 && (
              <span className="text-foreground"> ({discount}%)</span>
            )}
          </p>
        )}

        <AmazonAddToCartButton
          onClick={handleAddToCart}
          disabled={!purchasable}
        />
      </div>
    </article>
  );
}
