'use server';
import {prisma as dbContext} from '@/lib/prisma';
import {getClientNotificationsCookie} from '@/hooks/book/bookings-store';
import {readCloudStore} from '@/lib/cloud-store';

type GetNotificationsProps = {userId: string};

type GetNotificationsReturnType = {
  success: boolean;
  notifications: any[];
};

export const getNotifications = async ({
  userId,
}: GetNotificationsProps): Promise<GetNotificationsReturnType> => {
  try {
    const notifications = await dbContext.notification.findMany({
      where: {userId, read: false},
      orderBy: {createdAt: 'desc'},
    });

    if (notifications && notifications.length > 0) {
      return {success: true, notifications: notifications as any};
    }
  } catch {
    // Cloud fallback
  }

  try {
    const cookieNotifs = await getClientNotificationsCookie(userId);
    const store = readCloudStore();
    const storeNotifs = (store.notifications || []).filter(
      n => n.userId === userId && !n.read
    );
    const combined = [...cookieNotifs.filter(n => !n.read), ...storeNotifs];
    const unique = Array.from(new Map(combined.map(n => [n.id, n])).values());

    return {
      success: unique.length > 0,
      notifications: unique,
    };
  } catch {
    return {success: false, notifications: []};
  }
};
