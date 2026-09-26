import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fnb-pos-super-secret-key-change-in-prod';

  // Multi-cookie resolution for NextAuth v5 (HTTPS Vercel vs HTTP Localhost)
  const token =
    (await getToken({ req, secret, cookieName: '__Secure-authjs.session-token' })) ||
    (await getToken({ req, secret, cookieName: 'authjs.session-token' })) ||
    (await getToken({ req, secret, cookieName: '__Secure-next-auth.session-token' })) ||
    (await getToken({ req, secret, cookieName: 'next-auth.session-token' })) ||
    (await getToken({ req, secret }));

  const isLoggedIn = !!token;
  const userRole = (token as any)?.role;
  const { pathname } = req.nextUrl;

  // Protected paths
  const isPosPath = pathname.startsWith('/pos');
  const isDashboardPath = pathname.startsWith('/dashboard');
  const isAuthPage = pathname.startsWith('/login');

  if (isAuthPage && isLoggedIn) {
    if (userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/pos', req.url));
  }

  if (isPosPath || isDashboardPath) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // RBAC Guard: Only ADMIN can access /dashboard
    if (isDashboardPath && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/pos', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/pos/:path*', '/login'],
};
