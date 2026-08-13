'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { MOBILE_ERROR_MESSAGE, MOBILE_PATTERN, sanitizeMobileInput } from '@/lib/mobile';
import { AuthOrDivider, GoogleLoginButton } from '@/components/auth/google-login-button';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mobile: z.string().regex(MOBILE_PATTERN, MOBILE_ERROR_MESSAGE),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const { register: registerUser, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        mobile: data.mobile,
      });
      router.push(ROUTES.account);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  async function handleGoogleCredential(idToken: string) {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle(idToken);
      router.push(ROUTES.account);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="container-store flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase tracking-tight">Create Account</h1>
        <p className="mt-2 text-muted-foreground">Join PlayPro for exclusive access and faster checkout.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium" htmlFor="firstName">First Name</label>
              <Input id="firstName" className="mt-1" {...register('firstName')} />
              {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="lastName">Last Name</label>
              <Input id="lastName" className="mt-1" {...register('lastName')} />
              {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <Input id="email" type="email" className="mt-1" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="mobile">Mobile</label>
            <Input
              id="mobile"
              className="mt-1"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              {...register('mobile')}
              onChange={(e) => {
                const sanitized = sanitizeMobileInput(e.target.value);
                setValue('mobile', sanitized, { shouldValidate: true });
              }}
            />
            {errors.mobile && <p className="mt-1 text-xs text-destructive">{errors.mobile.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <Input id="password" type="password" className="mt-1" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || googleLoading}>
            {isSubmitting ? 'Creating…' : 'Create Account'}
          </Button>
        </form>

        <AuthOrDivider />

        <GoogleLoginButton
          onCredential={handleGoogleCredential}
          disabled={isSubmitting || googleLoading}
        />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href={ROUTES.login} className="font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
