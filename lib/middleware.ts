// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('Authorization')?.split(' ')[1];

  // If no token, redirect to signup
  if (!token) {
    return NextResponse.redirect(new URL('/signup', request.url));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const pathname = request.nextUrl.pathname;

    // Redirect based on role
    if (pathname.startsWith('/dashboard/buyer/home') && decoded.role !== 'buyer') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (pathname.startsWith('/dashboard/seller') && decoded.role !== 'seller') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Allow request if everything is valid
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/signup', request.url));
  }
}

// Apply middleware only to dashboard routes
export const config = {
  matcher: ['/dashboard/:path*, /buyers/home', '/seller'],
};
   