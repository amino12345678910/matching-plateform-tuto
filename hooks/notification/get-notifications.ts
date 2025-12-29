'use server';
import {prisma as dbContext} from '@/lib/prisma';

type GetNotificationsProps = {userId: string};

type GetNotificationsReturnType = {
  success: boolean;
  notifications: Notification[] | [];
};

export const getNotifications = async ({
  userId,
}: GetNotificationsProps): Promise<GetNotificationsReturnType> => {
  try {
    const notifications = await dbContext.notification.findMany({
      where: {userId, read: false},
      orderBy: {createdAt: 'desc'},
    });

    if (!notifications.length) return {success: false, notifications: []};
    return {success: true, notifications: (notifications as any) ?? []};
  } catch (error) {
    console.error(error);
    return {success: false, notifications: []};
  }
};
