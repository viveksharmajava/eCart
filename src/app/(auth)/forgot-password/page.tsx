'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

interface ForgotPasswordResult {
  message: string;
  resetLink?: string;
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [result, setResult] = useState<ForgotPasswordResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  async function onSubmit(data: FormData) {
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email.trim().toLowerCase() }),
      });

      let body: ForgotPasswordResult & { error?: string };
      try {
        body = await res.json();
      } catch {
        throw new Error('Unexpected response from server. Is the party service running on port 8082?');
      }

      if (!res.ok) {
        throw new Error(body.error ?? 'Unable to send reset link');
      }

      setResult({
        message:
          body.message ??
          'If an account exists for that email, a password reset link has been sent.',
        resetLink: body.resetLink,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link');
    }
  }

  return (
    <div className="container-store flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-black uppercase">Reset Password</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your registered email address and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {result && (
            <div className="space-y-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
              <p>{result.message}</p>
              {result.resetLink ? (
                <p>
                  Development reset link:{' '}
                  <Link href={result.resetLink} className="font-semibold underline">
                    Open reset page
                  </Link>
                </p>
              ) : (
                <p className="text-green-800">
                  If an account exists for that email, check your inbox (and spam folder) for the
                  reset link.
                </p>
              )}
            </div>
          )}
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              className="mt-1"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={Boolean(result)}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || Boolean(result)}
          >
            {isSubmitting ? 'Sending…' : 'Send Reset Link'}
          </Button>
        </form>

        <Link
          href={ROUTES.login}
          className="mt-6 inline-block text-sm text-muted-foreground hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
