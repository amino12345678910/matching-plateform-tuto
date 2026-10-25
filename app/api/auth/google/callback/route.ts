import {NextRequest, NextResponse} from 'next/server';
import {cloudGoogleSignIn} from '@/hooks/auth/cloud-auth';
import {consumeOAuthState} from '@/lib/session';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const returnedState = request.nextUrl.searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const verifiedRole = await consumeOAuthState(returnedState);
  if (!verifiedRole) {
    return NextResponse.redirect(new URL('/auth/login?error=invalid_oauth_state', request.url));
  }
  const role: 'USER' | 'SELLER' = verifiedRole;

  const clientId =
    process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const host = request.headers.get('x-forwarded-host') || request.nextUrl.host;
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = `${proto}://${host}`;
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
      return NextResponse.redirect(new URL('/auth/login?error=google_token', request.url));
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {Authorization: `Bearer ${tokenData.access_token}`},
    });
    const profile = await userRes.json();

    if (!profile?.email) {
      return NextResponse.redirect(new URL('/auth/login?error=google_profile', request.url));
    }

    const res = await cloudGoogleSignIn({
      email: profile.email,
      name: profile.name || profile.given_name || profile.email.split('@')[0],
      role,
      image: profile.picture || null,
    });

    const target =
      res.redirectTo || (role === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client');
    return NextResponse.redirect(new URL(target, request.url));
  } catch {
    return NextResponse.redirect(new URL('/auth/login?error=google_oauth', request.url));
  }
}
