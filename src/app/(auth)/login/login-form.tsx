'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { AuthOrDivider, GoogleLoginButton } from '@/components/auth/google-login-button';

const schema = z.object({
  username: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function redirectAfterAuth() {
    const redirect = searchParams.get('redirect') ?? ROUTES.account;
    router.push(redirect);
  }

  async function onSubmit(data: FormData) {
    setError('');
    try {
      await login(data.username, data.password);
      redirectAfterAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  async function handleGoogleCredential(idToken: string) {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle(idToken);
      redirectAfterAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="container-store flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase tracking-tight">Sign In</h1>
        <p className="mt-2 text-muted-foreground">Welcome back. Sign in to your account.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <label className="text-sm font-medium" htmlFor="username">
              Email / Username
            </label>
            <Input
              id="username"
              className="mt-1"
              {...register('username')}
              autoComplete="username"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              className="mt-1"
              {...register('password')}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Link
              href={ROUTES.forgotPassword}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || googleLoading}>
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <AuthOrDivider />

        <GoogleLoginButton
          onCredential={handleGoogleCredential}
          disabled={isSubmitting || googleLoading}
        />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.signup} className="font-semibold text-foreground hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
