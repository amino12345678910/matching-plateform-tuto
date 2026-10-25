'use server';

import {cookies} from 'next/headers';
import type {CloudBooking} from '@/lib/cloud-store';

const BOOKINGS_COOKIE_NAME = '9arrini_user_bookings';

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
    const updated = [booking, ...current.filter(b => b.id !== booking.id)].slice(0, 30);
    const encoded = Buffer.from(JSON.stringify(updated), 'utf-8').toString('base64url');
    cookieStore.set(BOOKINGS_COOKIE_NAME, encoded, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 60, // 60 days
    });
  } catch (err) {
    console.error('Error saving bookings cookie:', err);
  }
}
