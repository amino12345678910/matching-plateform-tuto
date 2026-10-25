'use server';

import {cookies} from 'next/headers';
import {
  type CloudBooking,
  type CloudPointTransaction,
  type CloudNotification,
  type CloudReview,
  type CloudChatMessage,
  type CloudSeller,
  readCloudStore,
  writeCloudStore,
  getAllCloudServices,
} from '@/lib/cloud-store';
import {formatScheduleLabel, getServiceMeetInfo} from '@/lib/google-meet';

const BOOKINGS_COOKIE_NAME = '9arrini_user_bookings';
const TX_COOKIE_NAME = '9arrini_user_transactions';
const NOTIFS_COOKIE_NAME = '9arrini_user_notifications';
const SERVICES_COOKIE_NAME = '9arrini_custom_services';
const REVIEWS_COOKIE_NAME = '9arrini_user_reviews';
const MESSAGES_COOKIE_NAME = '9arrini_user_messages';
const SELLERS_COOKIE_NAME = '9arrini_sellers_registry';

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
    const updated = [booking, ...current.filter(b => b.id !== booking.id)].slice(0, 20);
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
    const updated = [tx, ...current.filter(t => t.id !== tx.id)].slice(0, 25);
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

    // Automatically generate lesson reminders from real booked lessons
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
    ].slice(0, 25);
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

export async function getReviewsCookie(serviceId?: string): Promise<CloudReview[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(REVIEWS_COOKIE_NAME)?.value;
    if (!raw) return [];
    const json = Buffer.from(raw, 'base64url').toString('utf-8');
    const list = JSON.parse(json);
    if (!Array.isArray(list)) return [];
    if (serviceId) {
      return list.filter((r: CloudReview) => r.serviceId === serviceId || r.serviceSlug === serviceId);
    }
    return list;
  } catch {
    return [];
  }
}

export async function saveReviewCookie(review: CloudReview): Promise<void> {
  try {
    const cookieStore = await cookies();
    const current = await getReviewsCookie();
    const updated = [
      review,
      ...current.filter(
        r => !(r.clientId === review.clientId && r.serviceId === review.serviceId)
      ),
    ].slice(0, 20);
    const encoded = Buffer.from(JSON.stringify(updated), 'utf-8').toString('base64url');
    cookieStore.set(REVIEWS_COOKIE_NAME, encoded, COOKIE_OPTS);
  } catch (err) {
    console.error('Error saving review cookie:', err);
  }
}

export async function getMessagesCookie(): Promise<CloudChatMessage[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(MESSAGES_COOKIE_NAME)?.value;
    if (!raw) return [];
    const json = Buffer.from(raw, 'base64url').toString('utf-8');
    const list = JSON.parse(json);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveMessageCookie(msg: CloudChatMessage): Promise<void> {
  try {
    const cookieStore = await cookies();
    const current = await getMessagesCookie();
    const updated = [...current.filter(m => m.id !== msg.id), msg].slice(-25);
    const encoded = Buffer.from(JSON.stringify(updated), 'utf-8').toString('base64url');
    cookieStore.set(MESSAGES_COOKIE_NAME, encoded, COOKIE_OPTS);
  } catch (err) {
    console.error('Error saving message cookie:', err);
  }
}

export async function getCustomServicesCookie(): Promise<any[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SERVICES_COOKIE_NAME)?.value;
    if (!raw) return [];
    const json = Buffer.from(raw, 'base64url').toString('utf-8');
    const list = JSON.parse(json);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveCustomServiceCookie(serviceObj: any): Promise<void> {
  try {
    const cookieStore = await cookies();
    const current = await getCustomServicesCookie();
    // Store compact representation to fit comfortably in cookie
    const compact = {
      id: serviceObj.id,
      slug: serviceObj.slug,
      title: serviceObj.title,
      description: (serviceObj.description || '').slice(0, 900),
      meetLink: serviceObj.meetLink,
      scheduledDate: serviceObj.scheduledDate,
      scheduledTime: serviceObj.scheduledTime,
      images: (serviceObj.images || ['/assets/seo.webp']).slice(0, 2),
      status: serviceObj.status || 'ACTIVE',
      createdAt: serviceObj.createdAt,
      updatedAt: serviceObj.updatedAt,
      freelancerId: serviceObj.freelancerId,
      sellerId: serviceObj.sellerId,
      categoryId: serviceObj.categoryId,
      category: serviceObj.category,
      tags: (serviceObj.tags || []).slice(0, 4),
      faqs: (serviceObj.faqs || []).slice(0, 2),
      seller: serviceObj.seller,
      packages: serviceObj.packages,
    };
    const updated = [compact, ...current.filter(s => s.slug !== compact.slug && s.id !== compact.id)].slice(0, 6);
    const encoded = Buffer.from(JSON.stringify(updated), 'utf-8').toString('base64url');
    cookieStore.set(SERVICES_COOKIE_NAME, encoded, COOKIE_OPTS);
  } catch (err) {
    console.error('Error saving custom services cookie:', err);
  }
}

export async function deleteCustomServiceCookie(serviceId: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const current = await getCustomServicesCookie();
    const updated = current.filter(s => s.id !== serviceId && s.slug !== serviceId);
    const encoded = Buffer.from(JSON.stringify(updated), 'utf-8').toString('base64url');
    cookieStore.set(SERVICES_COOKIE_NAME, encoded, COOKIE_OPTS);
  } catch (err) {
    console.error('Error deleting custom service cookie:', err);
  }
}

export async function getSellersRegistryCookie(): Promise<CloudSeller[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SELLERS_COOKIE_NAME)?.value;
    if (!raw) return [];
    const json = Buffer.from(raw, 'base64url').toString('utf-8');
    const list = JSON.parse(json);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveSellerRegistryCookie(seller: CloudSeller): Promise<void> {
  try {
    const cookieStore = await cookies();
    const current = await getSellersRegistryCookie();
    const updated = [
      seller,
      ...current.filter(s => s.id !== seller.id && s.userId !== seller.userId),
    ].slice(0, 15);
    const encoded = Buffer.from(JSON.stringify(updated), 'utf-8').toString('base64url');
    cookieStore.set(SELLERS_COOKIE_NAME, encoded, COOKIE_OPTS);
  } catch (err) {
    console.error('Error saving seller registry cookie:', err);
  }
}

export async function getAllRealServices(): Promise<any[]> {
  const store = readCloudStore();
  const cookieServices = await getCustomServicesCookie();
  const cookieReviews = await getReviewsCookie();
  const cookieBookings = await getClientBookingsCookie();
  const cookieSellers = await getSellersRegistryCookie();

  // Sync any cookie services/reviews/bookings/sellers back into the warm instance cloud store
  let storeChanged = false;
  for (const cs of cookieSellers) {
    const idx = store.sellers.findIndex(s => s.userId === cs.userId || s.id === cs.id);
    if (idx === -1) {
      store.sellers.push(cs);
      storeChanged = true;
    } else if (cs.isVerified && !store.sellers[idx].isVerified) {
      store.sellers[idx] = {...store.sellers[idx], ...cs};
      storeChanged = true;
    }
  }
  for (const cs of cookieServices) {
    if (!store.customServices.some((s: any) => s.id === cs.id || s.slug === cs.slug)) {
      store.customServices.push(cs);
      storeChanged = true;
    }
  }
  for (const cr of cookieReviews) {
    if (!store.reviews.some(r => r.id === cr.id)) {
      store.reviews.push(cr);
      storeChanged = true;
    }
  }
  for (const cb of cookieBookings) {
    if (!store.bookings.some(b => b.id === cb.id)) {
      store.bookings.push(cb);
      storeChanged = true;
    }
  }
  if (storeChanged) {
    writeCloudStore(store);
  }

  return getAllCloudServices();
}
