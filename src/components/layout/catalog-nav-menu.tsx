'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { CatalogNavItem } from '@/types/nav';
import { cn } from '@/lib/utils';

interface CatalogNavMenuProps {
  catalogs: CatalogNavItem[];
  activeCatalogId?: string | null;
  onCatalogActivate: (catalog: CatalogNavItem | null) => void;
  className?: string;
}

export function CatalogNavMenu({
  catalogs,
  activeCatalogId,
  onCatalogActivate,
  className,
}: CatalogNavMenuProps) {
  return (
    <nav className={cn('flex items-center gap-5', className)} aria-label="Shop by catalog">
      {catalogs.map((catalog) => {
        const hasCategories = catalog.categories.length > 0;
        const isActive = activeCatalogId === catalog.prodCatalogId;

        return (
          <div
            key={catalog.prodCatalogId}
            className="relative"
            onMouseEnter={() => {
              if (hasCategories) onCatalogActivate(catalog);
            }}
            onFocus={() => {
              if (hasCategories) onCatalogActivate(catalog);
            }}
          >
            <Link
              href={catalog.href}
              className={cn(
                'relative flex items-center gap-1 whitespace-nowrap text-sm font-semibold uppercase tracking-wide transition-colors',
                'after:pointer-events-none after:absolute after:left-0 after:right-0 after:top-full after:mt-[15px] after:h-[2px] after:bg-[#2563eb] after:opacity-0 after:transition-opacity',
                'hover:after:opacity-100',
                isActive ? 'text-foreground after:opacity-100' : 'text-foreground/80 hover:text-foreground',
                hasCategories && 'pr-0.5',
              )}
              aria-expanded={hasCategories ? isActive : undefined}
              aria-haspopup={hasCategories ? 'true' : undefined}
            >
              {catalog.label}
              {hasCategories && (
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 opacity-60 transition-transform',
                    isActive && 'rotate-180',
                  )}
                  aria-hidden
                />
              )}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

interface CatalogMegaMenuProps {
  catalog: CatalogNavItem | null;
}

export function CatalogMegaMenu({ catalog }: CatalogMegaMenuProps) {
  if (!catalog?.categories.length) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full z-50 hidden border-t bg-background shadow-lg lg:block"
      role="region"
      aria-label={`${catalog.label} categories`}
    >
      <div className="container-store py-5 sm:py-6 lg:py-8">
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-border/60 pb-3">
          <p className="text-sm font-black uppercase tracking-wide">{catalog.label}</p>
          <Link
            href={catalog.href}
            className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            Shop all {catalog.label}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-6 md:gap-x-5 lg:grid-cols-8 xl:grid-cols-10">
          {catalog.categories.map((category) => (
            <Link
              key={category.categoryId}
              href={category.href}
              className="group/cat flex min-w-0 flex-col items-center gap-2 rounded-md p-2 text-center transition-colors hover:bg-muted/60"
            >
              <div className="relative aspect-square w-full max-w-[5.5rem] overflow-hidden rounded-lg bg-secondary sm:max-w-[6rem] md:max-w-[6.5rem] lg:max-w-[7rem]">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                    className="object-cover transition-transform duration-200 group-hover/cat:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-1 text-xs font-bold uppercase leading-tight text-muted-foreground">
                    {category.categoryName.slice(0, 2)}
                  </div>
                )}
              </div>
              <span className="line-clamp-2 w-full text-[10px] font-semibold uppercase leading-tight text-foreground/90 sm:text-[11px]">
                {category.categoryName}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
