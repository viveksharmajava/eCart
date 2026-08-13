import { NextResponse } from 'next/server';
import { z } from 'zod';
import { httpClient } from '@/services/http.client';
import {
  SESSION_COOKIE,
  serializeSessionCookie,
  sessionFromLogin,
  sessionToUser,
} from '@/lib/session';

const schema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

interface LoginResponse {
  username: string;
  partyId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  roles?: string[];
  authHeader: string;
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const login = await httpClient<LoginResponse>('/party/auth/google', {
      method: 'POST',
      body: { idToken: body.idToken },
    });

    const session = sessionFromLogin(login);
    const response = NextResponse.json({
      user: sessionToUser(session),
      authHeader: session.authHeader,
    });
    response.cookies.set(SESSION_COOKIE, serializeSessionCookie(session), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google login failed';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
