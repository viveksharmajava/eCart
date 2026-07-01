import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiError, httpClient } from '@/services/http.client';

const resetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

interface MessageResponse {
  message: string;
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = resetSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const result = await httpClient<MessageResponse>('/party/auth/reset-password', {
      method: 'POST',
      body: parsed.data,
    });
    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    const message = error instanceof Error ? error.message : 'Unable to reset password';
    return NextResponse.json(
      { error: message },
      { status: status >= 400 && status < 600 ? status : 503 },
    );
  }
}
