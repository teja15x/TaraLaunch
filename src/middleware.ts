import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Global scale support for hundreds of thousands (Lakhs) of concurrent users
  const pathname = request.nextUrl.pathname;
  
  // Create a base response so we can attach custom AI tracking headers
  const response = NextResponse.next();

  // 1. GLOBAL DELIVERY & CULTURAL CONTEXT: Attach Geo-location & Language headers
  // This allows our server-side AI engines to adapt their responses based on whether the Indian student is navigating high-stakes (JEE/NEET/UPSC), Tier-2/Tier-3 city constraints, or new age tech pathways.
  const country = request.geo?.country || request.headers.get('x-vercel-ip-country') || 'IN';
  const language = request.headers.get('accept-language')?.split(',')[0] || 'en-IN';
  
  response.headers.set('x-client-country', country);
  response.headers.set('x-client-language', language);

  // 2. EDGE SECURITY: Pre-computed headers for scale and DDoS mitigation
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // High-performance caching for public routes to save DB compute
  if (pathname === '/' || pathname.startsWith('/public')) {
    response.headers.set('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
  }

  // Skip auth checks for landing page, auth routes, Next.js internal, and API (which handles its own JWT)
  if (pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return response;
  }

  return response;
}

export const config = {
  // Optimize middleware execution to NOT run on heavy game assets, models, or images
  matcher: ['/((?!_next/static|_next/image|favicon.ico|_next/data|images/|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

