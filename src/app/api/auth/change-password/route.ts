import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { httpClient } from '@/services/http.client';
import { parseSessionCookie, SESSION_COOKIE } from '@/lib/session';

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

interface MessageResponse {
  message?: string;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = parseSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
    if (!session?.username) {
      return NextResponse.json({ error: 'Please sign in to change your password.' }, { status: 401 });
    }

    const body = schema.parse(await request.json());
    const result = await httpClient<MessageResponse>('/party/auth/change-password', {
      method: 'POST',
      body: {
        username: session.username,
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      },
    });

    return NextResponse.json({
      message: result.message ?? 'Your password has been updated successfully.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to change password';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
