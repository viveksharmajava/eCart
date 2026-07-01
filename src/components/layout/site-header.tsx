'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, Menu, ShoppingBag, User, X } from 'lucide-react';
import { APP_NAME, ROUTES } from '@/constants';
import type { CatalogNavItem } from '@/types/nav';
import { useAuth } from '@/hooks/use-auth';
import { useCartStore } from '@/store/cart.store';
import { useUiStore } from '@/store/ui.store';
import { useWishlistStore } from '@/store/wishlist.store';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/layout/search-bar';
import { CatalogMegaMenu, CatalogNavMenu } from '@/components/layout/catalog-nav-menu';

interface SiteHeaderProps {
  catalogNav: CatalogNavItem[];
}

export function SiteHeader({ catalogNav }: SiteHeaderProps) {
  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user, isAuthenticated } = useAuth();
  const { mobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const [activeCatalog, setActiveCatalog] = useState<CatalogNavItem | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="bg-primary text-center text-xs font-medium tracking-wide text-primary-foreground sm:text-sm">
        <p className="py-2">Free shipping on orders over ₹999 · New season drops live now</p>
      </div>

      <div
        className="relative"
        onMouseLeave={() => setActiveCatalog(null)}
      >
        <div className="container-store">
          <div className="flex h-16 items-center gap-3 lg:h-[72px] lg:gap-4">
            <div className="flex shrink-0 items-center gap-3 lg:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>

              <Link
                href={ROUTES.home}
                className="shrink-0 text-xl font-black uppercase tracking-tighter lg:text-2xl"
              >
                {APP_NAME}
              </Link>
            </div>

            <CatalogNavMenu
              catalogs={catalogNav}
              activeCatalogId={activeCatalog?.prodCatalogId}
              onCatalogActivate={setActiveCatalog}
              className="hidden min-w-0 flex-1 justify-end lg:ml-12 lg:flex xl:ml-16"
            />

            <div className="min-w-0 flex-1 lg:pl-2">
              <SearchBar variant="header" />
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Link href={ROUTES.wishlist} aria-label="Wishlist" className="relative hidden sm:inline-flex">
                <Button variant="ghost" size="icon">
                  <Heart />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href={ROUTES.account} aria-label="Account" className="hidden sm:inline-flex">
                <Button variant="ghost" size="icon" title={isAuthenticated ? user?.firstName ?? user?.username : 'Account'}>
                  <User />
                </Button>
              </Link>
              <Link href={ROUTES.cart} aria-label="Cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingBag />
                  {itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <CatalogMegaMenu catalog={activeCatalog} />
      </div>
    </header>
  );
}
