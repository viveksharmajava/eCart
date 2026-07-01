import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/account'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const authCookie = request.cookies.get('playpro-session');
    if (!authCookie?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|catalog|pricing|party|orders).*)'],
};
