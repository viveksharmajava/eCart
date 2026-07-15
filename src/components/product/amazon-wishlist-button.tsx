'use client';

import { Heart } from 'lucide-react';
import type { ProductSummary } from '@/types/catalog';
import { useWishlistStore } from '@/store/wishlist.store';
import { cn } from '@/lib/utils';

export const amazonWishlistButtonClasses = cn(
  'mt-2.5 block w-full cursor-pointer rounded-full border border-[#d5d9d9] bg-white px-0 py-0 text-center text-[#0f1111]',
  'transition-[background-color,border-color,box-shadow] duration-150',
  'hover:border-[#a2a6a6] hover:bg-[#f7fafa]',
  'active:bg-[#edf2f2] active:shadow-[inset_0_2px_5px_rgba(213,217,217,0.5)]',
);

export const amazonWishlistButtonInnerClasses =
  'inline-flex min-h-8 w-full items-center justify-center gap-1.5 px-3.5 py-1 text-[13px] font-normal leading-5';

export const amazonWishlistIconButtonClasses = cn(
  'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#d5d9d9] bg-white text-[#0f1111]',
  'transition-[background-color,border-color] duration-150',
  'hover:border-[#a2a6a6] hover:bg-[#f7fafa]',
  'active:bg-[#edf2f2]',
);

interface AmazonWishlistButtonProps {
  product: Pick<
    ProductSummary,
    'productId' | 'productName' | 'internalName' | 'brandName' | 'smallImageUrl' | 'mediumImageUrl' | 'largeImageUrl'
  >;
  imageUrl?: string;
  className?: string;
  /** Compact heart icon for product listing cards */
  iconOnly?: boolean;
}

export function AmazonWishlistButton({
  product,
  imageUrl,
  className,
  iconOnly = false,
}: AmazonWishlistButtonProps) {
  const toggle = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.productId));

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggle({
      productId: product.productId,
      productName: product.productName,
      internalName: product.internalName,
      brandName: product.brandName,
      smallImageUrl: product.smallImageUrl ?? imageUrl,
      mediumImageUrl: product.mediumImageUrl,
      largeImageUrl: product.largeImageUrl,
    });
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        className={cn(amazonWishlistIconButtonClasses, inWishlist && 'border-accent', className)}
        onClick={handleClick}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={inWishlist}
      >
        <Heart
          className={cn('h-4 w-4', inWishlist && 'fill-accent text-accent')}
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(amazonWishlistButtonClasses, inWishlist && 'border-accent', className)}
      onClick={handleClick}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={inWishlist}
    >
      <span className={amazonWishlistButtonInnerClasses}>
        <Heart
          className={cn('h-4 w-4 shrink-0', inWishlist && 'fill-accent text-accent')}
          aria-hidden="true"
        />
        <span>Wishlist</span>
      </span>
    </button>
  );
}
