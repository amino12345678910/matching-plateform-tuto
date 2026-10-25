import {NextRequest, NextResponse} from 'next/server';

const SESSION_COOKIE_NAME = '9arrini_user_session';

function parseSessionCookie(raw?: string): {
  userId?: string;
  role?: string;
  email?: string;
} | null {
  if (!raw) return null;
  try {
    const normalized = raw.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4;
    const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  // Never intercept Server Actions or POST/PUT/DELETE requests
  if (request.method !== 'GET') {
    return NextResponse.next();
  }

  try {
    const {pathname} = request.nextUrl;
    const rawCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = parseSessionCookie(rawCookie);

    const email = session?.email;
    const rawRole = session?.role;
    const role = rawRole === 'FREELANCER' || rawRole === 'SELLER' ? 'SELLER' : rawRole;

    if (role && email && ['/auth/login', '/auth/signup'].includes(pathname)) {
      return NextResponse.redirect(
        new URL(`/dashboard/${role === 'SELLER' ? 'freelancer' : 'client'}`, request.url)
      );
    }

    if (pathname === '/dashboard') {
      if (!email) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      return NextResponse.redirect(
        new URL(`/dashboard/${role === 'SELLER' ? 'freelancer' : 'client'}`, request.url)
      );
    }

    if (!email && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (email && pathname.startsWith('/dashboard')) {
      const isClient = role === 'USER';
      if (isClient && pathname.startsWith('/dashboard/freelancer')) {
        return NextResponse.redirect(new URL('/dashboard/client', request.url));
      }
    }
  } catch {
    // Never crash middleware
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path((?!message).*)', '/auth/login', '/auth/signup', '/dashboard'],
};
