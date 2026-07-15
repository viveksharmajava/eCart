'use client';



import { useUiStore } from '@/store/ui.store';

import type { CatalogNavItem } from '@/types/nav';

import { MobileCatalogNav } from '@/components/layout/mobile-catalog-nav';

import { cn } from '@/lib/utils';



interface MobileNavProps {

  catalogNav: CatalogNavItem[];

}



export function MobileNav({ catalogNav }: MobileNavProps) {

  const { mobileMenuOpen, setMobileMenuOpen } = useUiStore();



  return (

    <>

      <div

        className={cn(

          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',

          mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',

        )}

        onClick={() => setMobileMenuOpen(false)}

        aria-hidden="true"

      />

      <nav

        className={cn(

          'fixed inset-y-0 left-0 z-50 w-[min(320px,85vw)] overflow-y-auto bg-background p-6 shadow-xl transition-transform lg:hidden',

          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',

        )}

        aria-label="Mobile navigation"

      >

        <MobileCatalogNav catalogs={catalogNav} />

      </nav>

    </>

  );

}

