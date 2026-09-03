import Link from 'next/link';
import { APP_NAME, ROUTES } from '@/constants';
import { Separator } from '@/components/ui/separator';
import { getCatalogNav } from '@/features/catalog/nav-data';

export async function SiteFooter() {
  const catalogNav = await getCatalogNav();
  const shopLinks = [
    { label: 'All Products', href: ROUTES.products },
    ...catalogNav.slice(0, 6).map((item) => ({
      label: item.label,
      href: item.href,
    })),
  ];

  const footerLinks = {
    support: [
      { label: 'Help Center', href: ROUTES.help },
      { label: 'Contact Us', href: ROUTES.contact },
      { label: 'Shipping Policy', href: ROUTES.shipping },
      { label: 'Returns', href: ROUTES.refund },
    ],
    company: [
      { label: 'About Us', href: ROUTES.about },
      { label: 'Privacy Policy', href: ROUTES.privacy },
      { label: 'Terms & Conditions', href: ROUTES.terms },
    ],
    shop: shopLinks,
  };

  return (
    <footer className="border-t bg-secondary/50">
      <div className="container-store pt-5 pb-8 lg:pt-6 lg:pb-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <p className="text-lg font-black uppercase tracking-tighter">{APP_NAME}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Performance gear for athletes who demand more. Engineered for every game.
            </p>
          </div>
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                {section}
              </p>
              <ul className="mt-2 space-y-1.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-5" />
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Play Pro Sports. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
