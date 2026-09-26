import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;
  const { pathname } = req.nextUrl;

  // Protected paths
  const isPosPath = pathname.startsWith('/pos');
  const isDashboardPath = pathname.startsWith('/dashboard');
  const isAuthPage = pathname.startsWith('/login');

  if (isAuthPage && isLoggedIn) {
    // If already logged in, redirect based on role
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
});

export const config = {
  matcher: ['/dashboard/:path*', '/pos/:path*', '/login'],
};
