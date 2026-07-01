import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { getCatalogNav } from '@/features/catalog/nav-data';

export async function ShopLayout({ children }: { children: ReactNode }) {
  const catalogNav = await getCatalogNav();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader catalogNav={catalogNav} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <MobileNav catalogNav={catalogNav} />
    </div>
  );
}
