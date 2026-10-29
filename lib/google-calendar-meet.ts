import 'server-only';
import {cookies} from 'next/headers';
import {prisma} from '@/lib/prisma';
import {getDefaultSessionDate} from '@/lib/google-meet';

export const GOOGLE_TOKEN_COOKIE = '9arrini_google_oauth_token';

interface StoredGoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

async function refreshGoogleAccessToken(refreshToken: string): Promise<string | null> {
  const clientId =
    process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  if (!clientId || !clientSecret || !refreshToken) return null;

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    const data = await res.json();
    if (data?.access_token) {
      return data.access_token as string;
    }
  } catch {
    // ignore
  }
  return null;
}

async function getValidGoogleAccessToken(): Promise<string | null> {
  // 1. Check current user's Google token cookie
  try {
    const store = await cookies();
    const raw = store.get(GOOGLE_TOKEN_COOKIE)?.value;
    if (raw) {
      const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf-8')) as StoredGoogleTokens;
      if (parsed.accessToken && (!parsed.expiresAt || parsed.expiresAt > Date.now() + 30_000)) {
        return parsed.accessToken;
      }
      if (parsed.refreshToken) {
        const refreshed = await refreshGoogleAccessToken(parsed.refreshToken);
        if (refreshed) return refreshed;
      }
    }
  } catch {
    // ignore
  }

  // 2. Check Prisma Account table if present
  try {
    const db = prisma as any;
    if (db.account) {
      const account = await db.account.findFirst({
        where: {providerId: 'google'},
        orderBy: {updatedAt: 'desc'},
      });
      if (account) {
        if (
          account.accessToken &&
          (!account.accessTokenExpiresAt ||
            new Date(account.accessTokenExpiresAt).getTime() > Date.now() + 30_000)
        ) {
          return account.accessToken as string;
        }
        if (account.refreshToken) {
          const refreshed = await refreshGoogleAccessToken(account.refreshToken);
          if (refreshed) {
            await db.account.update({
              where: {id: account.id},
              data: {
                accessToken: refreshed,
                accessTokenExpiresAt: new Date(Date.now() + 3500 * 1000),
                updatedAt: new Date(),
              },
            });
            return refreshed;
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Automatically creates a real Google Meet (`https://meet.google.com/xxx-xxxx-xxx`)
 * via Google Calendar REST API (`conferenceDataVersion=1`) or Google Meet REST API v2.
 * Returns `null` if Google Calendar API is not yet authorized, allowing seamless fallback
 * to the automatic `/meet/9arrini-...` live video classroom.
 */
export async function createRealGoogleMeetAutomatically(params: {
  title: string;
  scheduledDate?: string;
  scheduledTime?: string;
  durationMinutes?: number;
}): Promise<string | null> {
  const accessToken = await getValidGoogleAccessToken();
  if (!accessToken) return null;

  const safeDate = params.scheduledDate || getDefaultSessionDate(2);
  const safeTime = params.scheduledTime || '18:00';
  const duration = params.durationMinutes || 60;

  const [y, m, d] = safeDate.split('-').map(Number);
  const [hh, mm] = safeTime.split(':').map(Number);
  const start = new Date(Date.UTC(y || 2026, (m || 1) - 1, d || 1, (hh || 18) - 1, mm || 0, 0));
  const end = new Date(start.getTime() + duration * 60 * 1000);

  // 1. Try Google Calendar API v3 (events.insert with conferenceDataVersion=1)
  try {
    const calRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: `🎓 9arrini : ${params.title}`,
          description: 'Séance de cours particulier générée automatiquement sur 9arrini.me',
          start: {dateTime: start.toISOString()},
          end: {dateTime: end.toISOString()},
          conferenceData: {
            createRequest: {
              requestId: `9arrini-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              conferenceSolutionKey: {type: 'hangoutsMeet'},
            },
          },
        }),
      }
    );

    if (calRes.ok) {
      const calData = await calRes.json();
      if (
        typeof calData?.hangoutLink === 'string' &&
        calData.hangoutLink.startsWith('https://meet.google.com/')
      ) {
        return calData.hangoutLink;
      }
    }
  } catch {
    // Fallback below
  }

  // 2. Try Google Meet REST API v2 (spaces.create)
  try {
    const meetRes = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (meetRes.ok) {
      const meetData = await meetRes.json();
      if (
        typeof meetData?.meetingUri === 'string' &&
        meetData.meetingUri.startsWith('https://meet.google.com/')
      ) {
        return meetData.meetingUri;
      }
    }
  } catch {
    // ignore
  }

  return null;
}
