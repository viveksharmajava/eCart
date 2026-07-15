'use client';

import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shared Amazon-style yellow pill button classes (Tailwind — works on all pages). */
export const amazonAtcButtonClasses = cn(
  'mt-2.5 block w-full cursor-pointer rounded-full border border-[#fcd200] bg-[#ffd814] px-0 py-0 text-center text-[#0f1111]',
  'transition-[background-color,border-color,box-shadow] duration-150',
  'hover:border-[#f2c200] hover:bg-[#f7ca00]',
  'active:bg-[#f0b800] active:shadow-[inset_0_2px_5px_rgba(213,217,217,0.5)]',
  'disabled:cursor-not-allowed disabled:opacity-55',
);

export const amazonAtcButtonInnerClasses =
  'inline-flex min-h-8 w-full items-center justify-center gap-1.5 px-3.5 py-1 text-[13px] font-normal leading-5';

interface AmazonAddToCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function AmazonAddToCartButton({
  onClick,
  disabled,
  className,
}: AmazonAddToCartButtonProps) {
  return (
    <button
      type="button"
      className={cn(amazonAtcButtonClasses, className)}
      onClick={onClick}
      disabled={disabled}
      aria-label="Add to Cart"
    >
      <span className={amazonAtcButtonInnerClasses}>
        <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Add to Cart</span>
      </span>
    </button>
  );
}
