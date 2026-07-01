'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VerifyOtpPage() {
  return (
    <div className="container-store flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-black uppercase">Verify OTP</h1>
        <p className="mt-2 text-muted-foreground">Enter the 6-digit code sent to your mobile.</p>
        <Input className="mt-8 text-center text-2xl tracking-[0.5em]" maxLength={6} placeholder="000000" />
        <Button className="mt-4 w-full" size="lg">Verify</Button>
        <p className="mt-4 text-sm text-muted-foreground">
          OTP login architecture placeholder — integrate SMS provider when ready.
        </p>
        <Link href={ROUTES.login} className="mt-6 inline-block text-sm hover:underline">Back to sign in</Link>
      </div>
    </div>
  );
}
