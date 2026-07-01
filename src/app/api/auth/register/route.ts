import { NextResponse } from 'next/server';
import { httpClient } from '@/services/http.client';
import {
  SESSION_COOKIE,
  serializeSessionCookie,
  sessionFromLogin,
  sessionToUser,
} from '@/lib/session';

interface LoginResponse {
  username: string;
  partyId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: string[];
  authHeader: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const login = await httpClient<LoginResponse>('/party/auth/register', {
      method: 'POST',
      body,
    });

    const session = sessionFromLogin(login);
    const response = NextResponse.json({ user: sessionToUser(session) });
    response.cookies.set(SESSION_COOKIE, serializeSessionCookie(session), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
