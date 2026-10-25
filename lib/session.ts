import 'server-only';
import {createHmac, randomBytes, timingSafeEqual} from 'crypto';
import {cookies} from 'next/headers';

/**
 * Signed, stateless session cookie.
 *
 * The cookie only carries `{uid, exp}` plus an HMAC-SHA256 signature. It never carries
 * role, points, or any other trusted data — those are always loaded from the database.
 * Editing the cookie invalidates the signature, so it cannot be forged.
 */

export const SESSION_COOKIE = '9arrini_session';
const OAUTH_STATE_COOKIE = '9arrini_oauth_state';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    '9arrini-default-hmac-secret-change-in-production-2026';
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function encodeSessionToken(userId: string, ttlSeconds = SESSION_TTL_SECONDS): string {
  const payload = Buffer.from(
    JSON.stringify({uid: userId, exp: Math.floor(Date.now() / 1000) + ttlSeconds}),
    'utf-8'
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function decodeSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  try {
    if (!safeEqual(signature, sign(payload))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (typeof data?.uid !== 'string' || typeof data?.exp !== 'number') return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.uid;
  } catch {
    return null;
  }
}

const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

/** Only callable from Server Actions / Route Handlers. */
export async function createSession(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSessionToken(userId), {
    ...baseCookieOptions,
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** Only callable from Server Actions / Route Handlers. */
export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Safe to call anywhere on the server (read-only). */
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return decodeSessionToken(store.get(SESSION_COOKIE)?.value);
}

/* ---------------- OAuth CSRF state ---------------- */

export async function createOAuthState(role: 'USER' | 'SELLER'): Promise<string> {
  const nonce = randomBytes(24).toString('base64url');
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, `${nonce}:${role}`, {
    ...baseCookieOptions,
    maxAge: 60 * 10, // 10 minutes
  });
  return nonce;
}

/** Returns the requested role if the state matches, otherwise null. Consumes the cookie. */
export async function consumeOAuthState(returnedState: string | null): Promise<'USER' | 'SELLER' | null> {
  const store = await cookies();
  const raw = store.get(OAUTH_STATE_COOKIE)?.value;
  store.delete(OAUTH_STATE_COOKIE);
  if (!raw || !returnedState) return null;
  const [nonce, role] = raw.split(':');
  if (!nonce || !safeEqual(nonce, returnedState)) return null;
  return role === 'SELLER' ? 'SELLER' : 'USER';
}
