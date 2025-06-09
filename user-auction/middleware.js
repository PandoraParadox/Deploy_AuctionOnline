import { NextResponse } from 'next/server';

export async function middleware(request) {
    const idToken = request.cookies.get('idToken')?.value;

    if (!idToken && !request.nextUrl.pathname.startsWith('/authen')) {
        return NextResponse.redirect(new URL('/authen', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|authen).*)'],
};