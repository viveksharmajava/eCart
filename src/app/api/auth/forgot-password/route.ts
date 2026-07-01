import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiError, httpClient } from '@/services/http.client';

const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

interface ForgotPasswordResponse {
  message: string;
  resetLink?: string;
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = emailSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Invalid email';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const result = await httpClient<ForgotPasswordResponse>('/party/auth/forgot-password', {
      method: 'POST',
      body: { email: parsed.data.email.trim().toLowerCase() },
    });
    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    const message = error instanceof Error ? error.message : 'Unable to process request';
    return NextResponse.json(
      { error: message },
      { status: status >= 400 && status < 600 ? status : 503 },
    );
  }
}
