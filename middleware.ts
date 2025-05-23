import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt";

// Standalone middleware for auth pages
async function authPagesMiddleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAuthenticated = !!token;
  const isAccessingAuthPage = 
    req.nextUrl.pathname.startsWith('/login') || 
    req.nextUrl.pathname.startsWith('/signup');

  if (isAuthenticated && isAccessingAuthPage) {
    // If user is admin, redirect to admin dashboard
    if (token.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    // Otherwise to regular dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

// Custom middleware for admin routes
async function adminMiddleware(req: NextRequest) {
  const token = await getToken({ req });
  
  // Check if user has admin role
  if (!token) {
    // If no token, redirect to login with callback URL
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`, req.url));
  }

  if (token.role !== 'admin') {
    // If token exists but not admin, redirect to unauthorized
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  
  return NextResponse.next();
}

// Protected routes middleware
export default withAuth(
  function middleware(req) {
    // First check if it's an auth page
    if (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup')) {
      return authPagesMiddleware(req);
    }
    
    // Check if it's an admin route
    if (req.nextUrl.pathname.startsWith('/admin')) {
      return adminMiddleware(req);
    }

    // For all other protected routes, just proceed (withAuth will handle the protection)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login and signup without a token
        if (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup')) {
          return true;
        }
        
        // For admin routes, check role
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token && token.role === 'admin';
        }
        
        // For all other protected routes, require a token
        return !!token;
      }
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Specify which routes should be protected by the middleware
export const config = {
  matcher: [
    // Protected routes that require authentication
    '/dashboard/:path*',
    '/account/:path*',
    '/add-listing/:path*', 
    '/calculator/:path*',
    '/university/:path*',
    '/directories/:path*', 
    '/leads/:path*',
    '/term-sheet/:path*',
    '/distressed/:path*', 
    '/contracts/:path*',
    '/perks/:path*',
    '/marketing/:path*',
    '/create-offer/:path*',
    // Admin routes that require admin role
    '/admin/:path*',
    // Auth pages for redirecting authenticated users
    '/login',
    '/signup',
  ]
}; 