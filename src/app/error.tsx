'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-store flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-black uppercase">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {error.message?.includes('Maximum update depth')
          ? 'A page component entered an infinite update loop. Refresh the page or clear site data for localhost and try again.'
          : 'The storefront could not load catalog data. Make sure the catalog service is running on port '}
        {!error.message?.includes('Maximum update depth') && (
          <>
            <strong>8080</strong> and pricing on <strong>8081</strong>.
          </>
        )}
      </p>
      {process.env.NODE_ENV === 'development' && (
        <p className="mt-2 max-w-lg break-all text-xs text-destructive">{error.message}</p>
      )}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href={ROUTES.products}>Browse products</Link>
        </Button>
      </div>
    </div>
  );
}
