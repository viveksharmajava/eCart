import Link from 'next/link';
import { ROUTES } from '@/constants';

const BRANDS = [
  { name: 'Nike', slug: 'nike' },
  { name: 'Adidas', slug: 'adidas' },
  { name: 'Yonex', slug: 'yonex' },
  { name: 'Puma', slug: 'puma' },
  { name: 'Asics', slug: 'asics' },
  { name: 'SG', slug: 'sg' },
];

export function BrandStrip() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {BRANDS.map((brand) => (
        <Link
          key={brand.slug}
          href={`${ROUTES.products}?brand=${brand.slug}`}
          className="flex h-20 min-w-[140px] shrink-0 items-center justify-center rounded-lg border bg-background px-6 text-lg font-black uppercase tracking-tight transition-colors hover:border-foreground"
        >
          {brand.name}
        </Link>
      ))}
    </div>
  );
}
