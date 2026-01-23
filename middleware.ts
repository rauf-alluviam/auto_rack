import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ---------------- API ROUTES ---------------- */
  // API routes handle their own auth logic or are public
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  /* ---------------- PUBLIC PAGES ---------------- */
  if (pathname === '/signin' || pathname === '/signup') {
    return NextResponse.next();
  }

  /* ---------------- BYPASS FOR CLIENT-SIDE AUTH DASHBOARD ---------------- */
  // ✅ FIX: Your Dashboard components use 'localStorage' (Client-Side).
  // Middleware runs on the Server and cannot read 'localStorage'.
  // Therefore, we CANNOT check tokens here for these routes.
  // We allow the request to pass through so the page loads, 
  // and the Dashboard's 'useEffect' will handle the auth check.
  if (pathname.startsWith('/buyers') || pathname.startsWith('/seller')) {
    return NextResponse.next();
  }

  /* ---------------- COOKIE AUTH (For other protected routes) ---------------- */
  // Only applies to routes that are NOT /buyers or /seller
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Add logic here if you have OTHER protected routes (e.g., /admin) that use Cookies
    // const role = payload.role;
    // if (pathname.startsWith('/admin') && role !== 'admin') {
    //   return NextResponse.redirect(new URL('/unauthorized', request.url));
    // }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}

/* ✅ MATCHER ---------------- */
export const config = {
  // We REMOVED /buyers and /seller from here.
  // This ensures Middleware does not run on Dashboard routes, 
  // allowing the Client-Side localStorage logic to work.
  // If you have other protected routes (like /admin), add them here.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};