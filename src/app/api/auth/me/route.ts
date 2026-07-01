import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSessionCookie, sessionToUser, SESSION_COOKIE } from '@/lib/session';

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const session = parseSessionCookie(raw);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: sessionToUser(session) });
}
