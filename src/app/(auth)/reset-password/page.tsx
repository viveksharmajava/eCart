'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-black uppercase">Invalid Link</h1>
        <p className="mt-2 text-muted-foreground">
          This password reset link is missing or invalid. Request a new link below.
        </p>
        <Button className="mt-6" asChild>
          <Link href={ROUTES.forgotPassword}>Request reset link</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(data: FormData) {
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? 'Unable to reset password');
      }
      setSuccess(body.message ?? 'Your password has been updated.');
      setTimeout(() => router.push(ROUTES.login), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-black uppercase">Set New Password</h1>
      <p className="mt-2 text-muted-foreground">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        <div>
          <label className="text-sm font-medium" htmlFor="password">
            New password
          </label>
          <Input
            id="password"
            type="password"
            className="mt-1"
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            className="mt-1"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || Boolean(success)}>
          {isSubmitting ? 'Updating…' : 'Update Password'}
        </Button>
      </form>

      <Link href={ROUTES.login} className="mt-6 inline-block text-sm text-muted-foreground hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container-store flex min-h-[60vh] items-center justify-center py-12">
      <Suspense fallback={<p>Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
