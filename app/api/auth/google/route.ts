import {NextRequest, NextResponse} from 'next/server';
import {createOAuthState} from '@/lib/session';

export async function GET(request: NextRequest) {
  const clientId =
    process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  if (request.nextUrl.searchParams.get('check') === '1') {
    return NextResponse.json({
      configured: Boolean(clientId && clientSecret),
    });
  }

  const rawRole = request.nextUrl.searchParams.get('role') || 'USER';
  const role: 'USER' | 'SELLER' =
    rawRole === 'SELLER' || rawRole === 'FREELANCER' ? 'SELLER' : 'USER';

  if (!clientId) {
    return NextResponse.redirect(
      new URL(`/auth/login?google_setup=1&role=${encodeURIComponent(role)}`, request.url)
    );
  }

  const host = request.headers.get('x-forwarded-host') || request.nextUrl.host;
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = `${proto}://${host}`;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;

  const stateNonce = await createOAuthState(role);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    access_type: 'online',
    state: stateNonce,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
