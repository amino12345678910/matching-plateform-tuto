import {NextRequest, NextResponse} from 'next/server';
import {getUserInfo} from './hooks/shared/get-user-info';
import {prisma as dbContext} from './lib/prisma';

export async function proxy(request: NextRequest) {
  const {userId, role, email} = await getUserInfo();

  const {pathname} = request.nextUrl;

  if (role && email && ['/auth/login', '/auth/signup'].includes(pathname)) {
    // Redirect authenticated users away from login/signup pages

    return NextResponse.redirect(
      new URL(`/dashboard/${role === 'SELLER' ? 'freelancer' : 'client'}`, request.url)
    );
  }

  if (pathname == '/dashboard') {
    return NextResponse.redirect(
      new URL(`/dashboard/${role === 'SELLER' ? 'freelancer' : 'client'}`, request.url)
    );
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!email && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/signup', request.url));
  }

  if (email && pathname.startsWith('/dashboard')) {
    const isFreelancer = role === 'SELLER';
    if (isFreelancer && pathname.startsWith('/dashboard')) {
      const hasService = await dbContext.service.findFirst({where: {seller: {userId}}});
      if (!hasService && pathname !== '/dashboard/freelancer/create-service') {
        return NextResponse.redirect(new URL('/dashboard/freelancer/create-service', request.url));
      } else if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/dashboard/freelancer', request.url));
      }
    }

    const isClient = role === 'USER';
    if (isClient && pathname.startsWith('/dashboard/freelancer')) {
      return NextResponse.redirect(new URL('/dashboard/client', request.url));
    } else if (isClient && pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/dashboard/client', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path((?!message).*)', '/auth/login', '/auth/signup', '/dashboard'],
};
