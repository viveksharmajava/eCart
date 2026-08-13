'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = [
  { href: ROUTES.account, label: 'Overview', exact: true },
  { href: ROUTES.accountProfile, label: 'Profile' },
  { href: ROUTES.accountResetPassword, label: 'Reset password' },
  { href: ROUTES.accountOrders, label: 'Orders' },
  { href: ROUTES.accountAddresses, label: 'Addresses' },
  { href: ROUTES.wishlist, label: 'Wishlist' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();

  async function handleSignOut() {
    await logout();
    router.replace(ROUTES.home);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="container-store py-16 text-center text-sm text-muted-foreground">
        Loading account…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-store py-16 text-center">
        <h1 className="text-3xl font-black uppercase">You&apos;re signed out</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to view your profile, orders, and saved addresses.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" variant="accent">
            <Link href={ROUTES.products}>Continue shopping</Link>
          </Button>
          <Button asChild size="lg">
            <Link href={`${ROUTES.login}?redirect=${encodeURIComponent(pathname || ROUTES.account)}`}>
              Login here
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-store py-8 lg:py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase">My Account</h1>
          {user && (
            <p className="mt-2 text-muted-foreground">
              {user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.username}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="cursor-pointer rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Sign out
        </button>
      </div>

      <nav className="mt-8 flex flex-wrap gap-2 border-b pb-4">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide',
                active ? 'bg-foreground text-background' : 'bg-secondary text-foreground/80 hover:bg-muted',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
