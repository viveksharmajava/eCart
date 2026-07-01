'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="container-store flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-black uppercase">Order confirmed</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Thank you for your purchase. We&apos;ve received your order
        {orderId ? (
          <>
            {' '}
            <strong>{orderId}</strong>
          </>
        ) : null}
        .
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {orderId && (
          <Button variant="outline" asChild>
            <Link href={`${ROUTES.accountOrders}/${encodeURIComponent(orderId)}`}>View order</Link>
          </Button>
        )}
        <Button asChild>
          <Link href={ROUTES.products}>Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-store py-16">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
