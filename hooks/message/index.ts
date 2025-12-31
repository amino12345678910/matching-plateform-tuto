'use server';

import {prisma as dbContext} from '@/lib/prisma';

type markMessageAsReadProps = {
  roomId: string;
  otherUserId: string;
};

export const markMessageAsRead = async ({otherUserId, roomId}: markMessageAsReadProps) => {
  await dbContext.message.updateMany({
    where: {roomId, senderId: otherUserId, read: false},
    data: {read: true},
  });
};
