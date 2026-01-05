import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
    // console.log('Middleware running checking ', request.nextUrl.pathname);
    const token = request.cookies.get('session_token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that logged-in users shouldn't access
    if (token) {
        if (pathname === '/' || pathname.startsWith('/auth')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/auth/:path*'],
};
