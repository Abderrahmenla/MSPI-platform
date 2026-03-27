import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Gate all other routes on the admin_token cookie
  const token = request.cookies.get('admin_token');
  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except Next.js internals and static assets.
     * This ensures the middleware only runs on page navigations, not on
     * _next/static, _next/image, favicon.ico, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
