import Link from 'next/link';
import type { CategoryNode } from '@/types/catalog';
import { productsCategoryHref } from '@/lib/category-links';

interface CategoryStripProps {
  categories: CategoryNode[];
}

const FALLBACK_CATEGORIES = [
  { categoryId: 'badminton', categoryName: 'Badminton', image: '/images/categories/badminton.jpg' },
  { categoryId: 'cricket', categoryName: 'Cricket', image: '/images/categories/cricket.jpg' },
  { categoryId: 'sports-shoes', categoryName: 'Sports Shoes', image: '/images/categories/shoes.jpg' },
  { categoryId: 'other-sports', categoryName: 'Other Sports', image: '/images/categories/other.jpg' },
];

export function CategoryStrip({ categories }: CategoryStripProps) {
  const validCategories = categories.filter((c) => c.categoryId);

  const items =
    validCategories.length > 0
      ? validCategories.slice(0, 8).map((c) => ({
          id: c.categoryId,
          name: c.categoryName ?? c.categoryId,
          href: productsCategoryHref(c.categoryId, c.categoryName),
        }))
      : FALLBACK_CATEGORIES.map((c) => ({
          id: c.categoryId,
          name: c.categoryName,
          href: productsCategoryHref(c.categoryId, c.categoryName),
        }));

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
