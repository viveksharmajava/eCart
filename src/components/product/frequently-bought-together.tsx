'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Plus, ShoppingBag } from 'lucide-react';
import { SectionHeading } from '@/components/home/section-heading';
import { Button } from '@/components/ui/button';
import { ProductPriceDisplay } from '@/components/product/product-price-display';
import { formatCurrency, productSlug } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { useCartStore } from '@/store/cart.store';
import type { EnrichedListProduct } from '@/types/filters';
import Link from 'next/link';

interface FrequentlyBoughtTogetherProps {
  productId: string;
  currentProduct: EnrichedListProduct;
}

async function fetchBundle(productId: string) {
  const res = await fetch(`/api/products/${encodeURIComponent(productId)}/frequently-bought`);
  if (!res.ok) return { products: [], bundleTotal: 0 };
  return res.json();
}

export function FrequentlyBoughtTogether({
  productId,
  currentProduct,
}: FrequentlyBoughtTogetherProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { data, isLoading } = useQuery({
    queryKey: ['fbt', productId],
    queryFn: () => fetchBundle(productId),
    staleTime: 5 * 60 * 1000,
  });

  const bundle = data?.products ?? [];
  if (!isLoading && bundle.length === 0) return null;

  const allItems = [currentProduct, ...bundle.slice(0, 2)];
  const total =
    allItems.reduce((sum, p) => sum + (p.salePrice ?? 0), 0);

  function addBundleToCart() {
    allItems.forEach((p) => {
      addItem({
        productId: p.productId,
        productName: p.productName ?? p.internalName ?? p.productId,
        brandName: p.brandName,
        imageUrl: p.imageUrl,
        quantity: 1,
        unitPrice: p.salePrice ?? 0,
        currency: p.currency,
      });
    });
  }

  return (
    <section className="mt-16 border-t pt-12">
      <SectionHeading title="Frequently Bought Together" />
      <div className="flex flex-col items-center gap-6 rounded-lg border p-6 lg:flex-row lg:justify-center">
        {isLoading ? (
          <p className="text-muted-foreground">Loading bundle…</p>
        ) : (
          <>
            {allItems.map((item, i) => (
              <div key={item.productId} className="flex items-center gap-4">
                {i > 0 && <Plus className="hidden h-5 w-5 text-muted-foreground lg:block" />}
                <Link
                  href={ROUTES.product(productSlug(item.productId, item.productName))}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-md bg-secondary">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt="" fill sizes="96px" className="object-cover" />
                    )}
                  </div>
                  <span className="max-w-[120px] line-clamp-2 text-xs">
                    {item.productName ?? item.productId}
                  </span>
                  <ProductPriceDisplay
                    salePrice={item.salePrice}
                    listPrice={item.listPrice}
                    currency={item.currency}
                    discountPercent={item.discountPercent}
                    size="sm"
                    layout="stacked"
                    className="mt-1"
                  />
                </Link>
              </div>
            ))}
            <div className="flex flex-col items-center gap-3 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="text-lg font-bold">
                Bundle: {formatCurrency(total, currentProduct.currency)}
              </p>
              <Button className="gap-2" onClick={addBundleToCart}>
                <ShoppingBag className="h-4 w-4" />
                Add all to cart
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
