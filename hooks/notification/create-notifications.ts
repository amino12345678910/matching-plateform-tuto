'use server';
import {prisma as dbContext} from '@/lib/prisma';
import type {NotificationType} from '@/types/notification';

type CreateNotificationProps = {
  userId: string;
  title: string;
  link?: string;
  type: NotificationType;
};

type CreateNotificationReturnType = {
  success: boolean;
};

export const createNotifications = async (
  notification: CreateNotificationProps[]
): Promise<CreateNotificationReturnType> => {
  try {
    const notificationResult = await dbContext.notification.createMany({
      data: notification,
    });

    if (!notificationResult) return {success: false};
    return {success: true};
  } catch (error) {
    console.error(error);
    return {success: false};
  }
};
