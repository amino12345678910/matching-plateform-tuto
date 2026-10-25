'use server';

import {prisma as dbContext} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';
import type {Notification, NotificationType} from '@/types/notification';
import {
  getClientNotificationsCookie,
  saveClientNotificationCookie,
  markClientNotificationsReadCookie,
} from '@/hooks/book/bookings-store';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';

export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const dbNotifs = await dbContext.notification.findMany({
      where: {userId},
      orderBy: {createdAt: 'desc'},
    });
    if (dbNotifs && dbNotifs.length > 0) {
      return dbNotifs as unknown as Notification[];
    }
  } catch {
    // Cloud fallback
  }

  const cookieNotifs = await getClientNotificationsCookie(userId);
  const store = readCloudStore();
  const storeNotifs = (store.notifications || []).filter(n => n.userId === userId);

  const combined = [...cookieNotifs, ...storeNotifs];
  const unique = Array.from(new Map(combined.map(n => [n.id, n])).values());

  return unique.map(n => ({
    id: n.id,
    userId: n.userId,
    title: n.title,
    type: n.type as NotificationType,
    link: n.link || '/dashboard/client/bookings',
    read: Boolean(n.read),
    createdAt: new Date(n.createdAt),
  }));
}

export async function markNotificationRead(userId: string, notificationId?: string) {
  try {
    if (!notificationId) {
      await dbContext.notification.updateMany({
        where: {userId, read: false},
        data: {read: true},
      });
    } else {
      await dbContext.notification.update({
        where: {id: notificationId, userId},
        data: {read: true},
      });
    }
  } catch {
    // Cloud fallback
  }

  await markClientNotificationsReadCookie(userId, notificationId);

  try {
    const store = readCloudStore();
    if (Array.isArray(store.notifications)) {
      store.notifications = store.notifications.map(n => {
        if (n.userId === userId && (!notificationId || n.id === notificationId)) {
          return {...n, read: true};
        }
        return n;
      });
      writeCloudStore(store);
    }
  } catch {
    // ignore
  }

  revalidatePath('/notification');
}

type CreateNotificationProps = {
  userId: string;
  title: string;
  link?: string;
  type: NotificationType;
};

export async function createNotifications(notifications: CreateNotificationProps[]) {
  try {
    await dbContext.notification.createMany({data: notifications});
  } catch {
    // Cloud fallback
  }

  const now = new Date().toISOString();
  const formatted = notifications.map((n, idx) => ({
    id: `notif_${Date.now()}_${idx}`,
    userId: n.userId,
    title: n.title,
    type: (n.type || 'ORDER') as any,
    link: n.link || '/dashboard/client/bookings',
    read: false,
    createdAt: now,
  }));

  await saveClientNotificationCookie(formatted);

  try {
    const store = readCloudStore();
    if (!Array.isArray(store.notifications)) store.notifications = [];
    store.notifications.unshift(...formatted);
    writeCloudStore(store);
  } catch {
    // ignore
  }
}
