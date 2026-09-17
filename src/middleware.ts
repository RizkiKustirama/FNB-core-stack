import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'fnb-pos-super-secret-key-change-in-prod',
  });

  const { pathname } = req.nextUrl;

  // Protected paths
  const isPosPath = pathname.startsWith('/pos');
  const isDashboardPath = pathname.startsWith('/dashboard');
  const isAuthPage = pathname.startsWith('/login');

  if (isAuthPage && token) {
    // If already logged in, redirect based on role
    if (token.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/pos', req.url));
  }

  if (isPosPath || isDashboardPath) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // RBAC Guard: Only ADMIN can access /dashboard
    if (isDashboardPath && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/pos', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/pos/:path*', '/login'],
};
