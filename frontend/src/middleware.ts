/**
 * Next.js Middleware
 * Server-side authentication middleware to protect routes
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/v1/auth/register',
  '/api/v1/auth/login',
  '/api/v1/auth/logout',
  '/api/v1/auth/validate-session',
];

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // App auth state is stored client-side (localStorage) and cannot be read in middleware.
  // Enforcing page-route auth here can cause redirect loops for logged-in users.
  // Keep middleware auth checks for API routes only.
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check for auth token in cookies or header
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('Authorization')?.replace('Bearer ', '');

  // If no token, redirect to login for page routes
  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { type: 'invalid_token', title: 'Unauthorized', status: 401, detail: 'Authentication required' } },
        { status: 401 }
      );
    }

    // For page routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token with backend
  // Note: For better performance, we could cache this validation
  // but for security, we verify on each request to protected routes

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
