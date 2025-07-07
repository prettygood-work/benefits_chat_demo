import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { guestRegex, isDevelopmentEnvironment } from './lib/constants';

function getSubdomain(hostname: string): string | null {
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return null;
  }

  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  const hostname = request.headers.get('host') || '';

  const subdomain = getSubdomain(hostname);

  // Use getSubdomain and then, if valid, rewrite URL as: 
  // url.pathname = `/t/${subdomain}${pathname}`;
  if (subdomain && subdomain !== 'www' && subdomain !== 'admin' && subdomain !== 'app') {
    url.pathname = `/t/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  if (pathname.startsWith('/api/auth') || pathname.startsWith('/t/')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || (isDevelopmentEnvironment ? 'development-secret-key' : undefined),
    secureCookie: !isDevelopmentEnvironment,
  });

  if (isDevelopmentEnvironment && !process.env.AUTH_SECRET) {
    console.warn('AUTH_SECRET is not defined. Using fallback for development only.');
  }

  if (!token) {
    const redirectUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(
      new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url),
    );
  }

  const isGuest = guestRegex.test(token?.email ?? '');

  if (token && !isGuest && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public assets (e.g. /logo.svg)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|logo.svg).*)',
  ],
};
