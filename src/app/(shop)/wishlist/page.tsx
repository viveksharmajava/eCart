'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants';
import { useWishlistStore } from '@/store/wishlist.store';
import { ProductGrid } from '@/components/product/product-grid';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);

  if (items.length === 0) {
    return (
      <div className="container-store py-16 text-center">
        <h1 className="text-2xl font-black uppercase">Wishlist</h1>
        <p className="mt-2 text-muted-foreground">Save items you love for later.</p>
        <Button className="mt-8" asChild><Link href={ROUTES.products}>Browse Products</Link></Button>
      </div>
    );
  }

  return (
    <div className="container-store py-8 lg:py-12">
      <h1 className="text-3xl font-black uppercase">Wishlist</h1>
      <ProductGrid products={items.map((p) => ({ ...p }))} />
    </div>
  );
}
