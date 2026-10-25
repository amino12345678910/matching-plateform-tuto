'use server';

import {cookies} from 'next/headers';
import type {
  CloudBooking,
  CloudPointTransaction,
  CloudNotification,
} from '@/lib/cloud-store';
import {formatScheduleLabel, getServiceMeetInfo} from '@/lib/google-meet';

const BOOKINGS_COOKIE_NAME = '9arrini_user_bookings';
const TX_COOKIE_NAME = '9arrini_user_transactions';
const NOTIFS_COOKIE_NAME = '9arrini_user_notifications';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 60, // 60 days
};

export async function getClientBookingsCookie(userId?: string): Promise<CloudBooking[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(BOOKINGS_COOKIE_NAME)?.value;
    if (!raw) return [];
    const json = Buffer.from(raw, 'base64url').toString('utf-8');
    const list = JSON.parse(json);
    if (!Array.isArray(list)) return [];
    if (userId) {
      return list.filter((b: CloudBooking) => b.clientId === userId || b.freelancerId === userId);
    }
    return list;
  } catch {
    return [];
  }
}

export async function saveClientBookingCookie(booking: CloudBooking): Promise<void> {
  try {
    const cookieStore = await cookies();
    const current = await getClientBookingsCookie();
    const updated = [booking, ...current.filter(b => b.id !== booking.id)].slice(0, 25);
    const encoded = Buffer.from(JSON.stringify(updated), 'utf-8').toString('base64url');
    cookieStore.set(BOOKINGS_COOKIE_NAME, encoded, COOKIE_OPTS);
  } catch (err) {
    console.error('Error saving bookings cookie:', err);
  }
}

export async function getClientTransactionsCookie(
  userId?: string
): Promise<CloudPointTransaction[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(TX_COOKIE_NAME)?.value;
    if (!raw) return [];
    const json = Buffer.from(raw, 'base64url').toString('utf-8');
    const list = JSON.parse(json);
    if (!Array.isArray(list)) return [];
    if (userId) {
      return list.filter((t: CloudPointTransaction) => t.userId === userId);
    }
    return list;
  } catch {
    return [];
  }
}

export async function saveClientTransactionCookie(tx: CloudPointTransaction): Promise<void> {
  try {
    const cookieStore = await cookies();
    const current = await getClientTransactionsCookie();
    const updated = [tx, ...current.filter(t => t.id !== tx.id)].slice(0, 30);
    const encoded = Buffer.from(JSON.stringify(updated), 'utf-8').toString('base64url');
    cookieStore.set(TX_COOKIE_NAME, encoded, COOKIE_OPTS);
  } catch (err) {
    console.error('Error saving transaction cookie:', err);
  }
}

export async function getClientNotificationsCookie(
  userId?: string
): Promise<CloudNotification[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(NOTIFS_COOKIE_NAME)?.value;
    let list: CloudNotification[] = [];
    if (raw) {
      const json = Buffer.from(raw, 'base64url').toString('utf-8');
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) list = parsed;
    }

    // Automatically generate lesson reminders from booked lessons so user never misses a session
    const bookings = await getClientBookingsCookie(userId);
    const reminderNotifs: CloudNotification[] = bookings.map(b => {
      const meetInfo = getServiceMeetInfo({
        slug: b.serviceSlug,
        title: b.serviceTitle,
        scheduledDate: b.scheduledDate,
        scheduledTime: b.scheduledTime,
        meetLink: b.meetUrl,
      });
      const dateStr = formatScheduleLabel(meetInfo.scheduledDate, meetInfo.scheduledTime);
      return {
        id: `rem_${b.id}`,
        userId: b.clientId,
        title: `⏰ Rappel de cours : "${b.serviceTitle}" avec ${b.freelancerName} — Prévu le ${dateStr}. Lien Google Meet : ${meetInfo.meetUrl}`,
        type: 'ORDER' as const,
        link: '/dashboard/client/bookings',
        read: false,
        createdAt: b.createdAt,
      };
    });

    const combined = [...list];
    for (const rem of reminderNotifs) {
      if (!combined.some(n => n.id === rem.id)) {
        combined.push(rem);
      }
    }

    if (userId) {
      return combined.filter(n => n.userId === userId);
    }
    return combined;
  } catch {
    return [];
  }
}

export async function saveClientNotificationCookie(
  items: CloudNotification | CloudNotification[]
): Promise<void> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(NOTIFS_COOKIE_NAME)?.value;
    let current: CloudNotification[] = [];
    if (raw) {
      const json = Buffer.from(raw, 'base64url').toString('utf-8');
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) current = parsed;
    }
    const newArr = Array.isArray(items) ? items : [items];
    const updated = [
      ...newArr,
      ...current.filter(c => !newArr.some(n => n.id === c.id)),
    ].slice(0, 30);
    const encoded = Buffer.from(JSON.stringify(updated), 'utf-8').toString('base64url');
    cookieStore.set(NOTIFS_COOKIE_NAME, encoded, COOKIE_OPTS);
  } catch (err) {
    console.error('Error saving notifications cookie:', err);
  }
}

export async function markClientNotificationsReadCookie(
  userId: string,
  notificationId?: string
): Promise<void> {
  try {
    const current = await getClientNotificationsCookie();
    const updated = current.map(n => {
      if (n.userId === userId && (!notificationId || n.id === notificationId)) {
        return {...n, read: true};
      }
      return n;
    });
    const cookieStore = await cookies();
    const encoded = Buffer.from(JSON.stringify(updated), 'utf-8').toString('base64url');
    cookieStore.set(NOTIFS_COOKIE_NAME, encoded, COOKIE_OPTS);
  } catch (err) {
    console.error('Error marking notifications read:', err);
  }
}
