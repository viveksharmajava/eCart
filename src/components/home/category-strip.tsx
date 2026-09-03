import Link from 'next/link';
import type { ProdCatalogSummary } from '@/types/catalog';
import { productsCatalogHref } from '@/lib/category-links';

interface CategoryStripProps {
  catalogs: ProdCatalogSummary[];
}

export function CategoryStrip({ catalogs }: CategoryStripProps) {
  const items = catalogs
    .filter((c) => c.prodCatalogId)
    .slice(0, 8)
    .map((c) => ({
      id: c.prodCatalogId,
      name: c.catalogName?.trim() || c.prodCatalogId,
      href: productsCatalogHref(c.prodCatalogId),
    }));

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-0 flex items-end p-4">
            <span className="text-sm font-bold uppercase tracking-wide text-white sm:text-base">
              {item.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
