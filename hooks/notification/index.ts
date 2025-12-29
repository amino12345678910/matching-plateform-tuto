'use server';

import {prisma as dbContext} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';
import type {Notification, NotificationType} from '@/types/notification';

export async function getNotifications(userId: string): Promise<Notification[]> {
  return await dbContext.notification.findMany({
    where: {userId},
    orderBy: {createdAt: 'desc'},
  });
}

export async function markNotificationRead(userId: string, notificationId?: string) {
  if (!notificationId)
    await dbContext.notification.updateMany({
      where: {userId, read: false},
      data: {read: true},
    });
  else {
    await dbContext.notification.update({
      where: {id: notificationId, userId},
      data: {read: true},
    });
  }

  revalidatePath('/dashboard/notifications');
}

type CreateNotificationProps = {
  userId: string;
  title: string;
  link?: string;
  type: NotificationType;
};

export async function createNotifications(notification: CreateNotificationProps[]) {
  await dbContext.notification.createMany({data: notification});
}
