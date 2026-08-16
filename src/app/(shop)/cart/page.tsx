'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Minus, Plus, Trash2 } from 'lucide-react';
import { Suspense, useState } from 'react';
import { ROUTES } from '@/constants';
import { applyCouponCode, computeCartTotals } from '@/lib/commerce';
import { useCartStore } from '@/store/cart.store';
import { formatCurrency, productSlug } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

function AddedToCartBanner({ itemName }: { itemName: string }) {
  return (
    <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-700" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-base font-medium text-green-900 sm:text-lg">
            The Items {itemName} is added to the cart
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="lg" asChild>
              <Link href={ROUTES.home}>Continue Shopping</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href={ROUTES.checkout}>Continue Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPageContent() {
  const searchParams = useSearchParams();
  const addedItemName = searchParams.get('added')?.trim() || null;
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    couponCode,
    outOfStockProductIds,
  } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const outOfStockIds = outOfStockProductIds ?? [];
  const hasOutOfStock = items.some((item) => outOfStockIds.includes(item.productId));

  if (items.length === 0) {
    return (
      <div className="container-store flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-black uppercase">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add items to get started.</p>
        <Button className="mt-8" asChild>
          <Link href={ROUTES.home}>Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    const discount = applyCouponCode(code, subtotal());
    if (discount > 0) applyCoupon(code, discount);
  }

  const totals = computeCartTotals(items, couponDiscount);

  return (
    <div className="container-store py-8 lg:py-12">
      {addedItemName && <AddedToCartBanner itemName={addedItemName} />}

      <h1 className="text-3xl font-black uppercase tracking-tight">Cart</h1>
      {hasOutOfStock && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Some items below are currently out of stock. Please remove them before placing your order.
        </div>
      )}
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const outOfStock = outOfStockIds.includes(item.productId);
            return (
              <div
                key={`${item.productId}-${item.variantId ?? ''}`}
                className={`flex gap-4 rounded-lg border p-4 ${
                  outOfStock ? 'border-destructive/40 bg-destructive/5' : ''
                }`}
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  {outOfStock && (
                    <p className="mb-1 text-xs font-medium text-destructive">
                      This item is currently out of stock
                    </p>
                  )}
                  <Link
                    href={ROUTES.product(productSlug(item.productId, item.productName))}
                    className="font-medium hover:underline"
                  >
                    {item.productName}
                  </Link>
                  {item.brandName && (
                    <p className="text-xs text-muted-foreground">{item.brandName}</p>
                  )}
                  <p className="mt-auto font-semibold">
                    {formatCurrency(item.unitPrice * item.quantity, item.currency)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(item.productId, item.variantId)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1, item.variantId)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={outOfStock}
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1, item.variantId)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-lg border p-6">
          <h2 className="font-semibold uppercase tracking-wide">Order Summary</h2>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              disabled={!!couponCode}
            />
            {couponCode ? (
              <Button variant="destructive" onClick={removeCoupon}>
                Remove
              </Button>
            ) : (
              <Button variant="outline" onClick={handleApplyCoupon}>
                Apply
              </Button>
            )}
          </div>
          {couponCode && (
            <p className="mt-2 text-sm text-green-700">Coupon {couponCode} applied</p>
          )}
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal())}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (GST included)</span>
              <span>—</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(totals.grandTotal)}</span>
          </div>
          {hasOutOfStock ? (
            <>
              <Button className="mt-6 w-full" size="lg" disabled>
                Proceed to Checkout
              </Button>
              <p className="mt-2 text-center text-xs text-destructive">
                Remove out-of-stock items to continue checkout.
              </p>
            </>
          ) : (
            <Button className="mt-6 w-full" size="lg" asChild>
              <Link href={ROUTES.checkout}>Proceed to Checkout</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="container-store py-8 lg:py-12">
          <h1 className="text-3xl font-black uppercase tracking-tight">Cart</h1>
          <p className="mt-4 text-muted-foreground">Loading cart…</p>
        </div>
      }
    >
      <CartPageContent />
    </Suspense>
  );
}
