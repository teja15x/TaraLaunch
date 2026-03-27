import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip auth for landing page and auth routes
  const pathname = request.nextUrl.pathname;
  if (pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // For protected routes, try auth check (non-blocking)
  try {
    // Dynamic import would block here, so just pass through for now
    // Auth will be handled at the page/layout level
    return NextResponse.next();
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
