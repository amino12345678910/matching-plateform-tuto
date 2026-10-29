import {createHmac, timingSafeEqual} from 'crypto';
import {NextRequest, NextResponse} from 'next/server';

const SESSION_COOKIE_NAME = '9arrini_user_session_v4';
const ACCOUNT_BACKUP_COOKIE = '9arrini_account_backup_v4';

function getSessionSecret(): string {
  return (
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    '9arrini-default-hmac-secret-change-in-production-2026'
  );
}

function parseSessionCookie(raw?: string): {
  userId?: string;
  role?: string;
  email?: string;
} | null {
  if (!raw) return null;
  try {
    const parts = raw.split('.');
    if (parts.length !== 2) return null;
    const [body, sig] = parts;
    if (!body || !sig) return null;

    const expectedSig = createHmac('sha256', getSessionSecret())
      .update(body)
      .digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const json = Buffer.from(body, 'base64url').toString('utf-8');
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
    const rawCookie =
      request.cookies.get(SESSION_COOKIE_NAME)?.value ||
      request.cookies.get(ACCOUNT_BACKUP_COOKIE)?.value;
    const session = parseSessionCookie(rawCookie);

    const email = session?.email;
    const rawRole = session?.role;
    const role = rawRole === 'FREELANCER' || rawRole === 'SELLER' ? 'SELLER' : rawRole;

    if (role && email && ['/auth/login', '/auth/signup'].includes(pathname)) {
      return NextResponse.redirect(
        new URL(
          role === 'ADMIN'
            ? '/admin'
            : `/dashboard/${role === 'SELLER' ? 'freelancer' : 'client'}`,
          request.url
        )
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
