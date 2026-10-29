import {NextRequest, NextResponse} from 'next/server';
import {
  cloudGoogleSignIn,
  encodeSessionCookieValue,
  getSessionCookieNames,
} from '@/hooks/auth/cloud-auth';
import {consumeOAuthState} from '@/lib/session';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const returnedState = request.nextUrl.searchParams.get('state');

  const host = request.headers.get('x-forwarded-host') || request.nextUrl.host;
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = `${proto}://${host}`;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  const verifiedRole = (await consumeOAuthState(returnedState)) || 'USER';
  const role: 'USER' | 'SELLER' = verifiedRole === 'SELLER' ? 'SELLER' : 'USER';

  const clientId =
    process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${origin}/auth/login?error=google_token`);
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {Authorization: `Bearer ${tokenData.access_token}`},
    });
    const profile = await userRes.json();

    if (!profile?.email) {
      return NextResponse.redirect(`${origin}/auth/login?error=google_profile`);
    }

    const res = await cloudGoogleSignIn({
      email: profile.email,
      name: profile.name || profile.given_name || profile.email.split('@')[0],
      role,
      image: profile.picture || null,
    });

    const target =
      res.redirectTo || (role === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client');
    const response = NextResponse.redirect(`${origin}${target}`);

    if (res.user) {
      const encoded = await encodeSessionCookieValue(res.user);
      const {SESSION_COOKIE_NAME, ACCOUNT_BACKUP_COOKIE} = await getSessionCookieNames();
      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      };
      response.cookies.set(SESSION_COOKIE_NAME, encoded, cookieOpts);
      response.cookies.set(ACCOUNT_BACKUP_COOKIE, encoded, cookieOpts);
    }

    return response;
  } catch {
    return NextResponse.redirect(`${origin}/auth/login?error=google_oauth`);
  }
}
