import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  const { pathname } = request.nextUrl;
  
  // Public pages (redirect logged-in users away from these)
  const publicPages = ['/login', '/register'];
  // Public API endpoints (always allow through)
  const publicAPIs = ['/api/auth/login', '/api/auth/register', '/api/auth/logout'];
  
  // Allow next static files, images, favicon etc
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Always allow public API routes through
  if (publicAPIs.includes(pathname)) {
    return NextResponse.next();
  }

  // If user is trying to access login/register but is already logged in, redirect home
  if (publicPages.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is trying to access a protected path without a token, redirect to login
  if (!publicPages.includes(pathname) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
