'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ROUTES } from '@/constants';
import type { CatalogNavItem } from '@/types/nav';
import { useUiStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

interface MobileCatalogNavProps {
  catalogs: CatalogNavItem[];
}

export function MobileCatalogNav({ catalogs }: MobileCatalogNavProps) {
  const { setMobileMenuOpen } = useUiStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Shop by Catalog
      </p>
      <ul className="space-y-2">
        {catalogs.map((catalog) => {
          const isOpen = expandedId === catalog.prodCatalogId;
          const hasCategories = catalog.categories.length > 0;

          return (
            <li key={catalog.prodCatalogId} className="border-b border-border/60 pb-2">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={catalog.href}
                  className="text-lg font-semibold uppercase tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {catalog.label}
                </Link>
                {hasCategories && (
                  <button
                    type="button"
                    className="rounded p-1 text-muted-foreground"
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${catalog.label} categories`}
                    onClick={() =>
                      setExpandedId(isOpen ? null : catalog.prodCatalogId)
                    }
                  >
                    <ChevronDown className={cn('h-5 w-5 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                )}
              </div>
              {hasCategories && isOpen && (
                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {catalog.categories.map((category) => (
                    <Link
                      key={category.categoryId}
                      href={category.href}
                      className="flex flex-col items-center gap-1.5 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-md bg-secondary">
                        {category.imageUrl ? (
                          <Image
                            src={category.imageUrl}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-bold uppercase text-muted-foreground">
                            {category.categoryName.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <span className="line-clamp-2 text-[10px] font-semibold uppercase leading-tight">
                        {category.categoryName}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <hr className="my-6 border-border" />
      <ul className="space-y-3 text-sm">
        <li>
          <Link href={ROUTES.products} onClick={() => setMobileMenuOpen(false)}>
            All Products
          </Link>
        </li>
        <li>
          <Link href={ROUTES.account} onClick={() => setMobileMenuOpen(false)}>
            My Account
          </Link>
        </li>
        <li>
          <Link href={ROUTES.wishlist} onClick={() => setMobileMenuOpen(false)}>
            Wishlist
          </Link>
        </li>
        <li>
          <Link href={ROUTES.help} onClick={() => setMobileMenuOpen(false)}>
            Help
          </Link>
        </li>
      </ul>
    </>
  );
}
