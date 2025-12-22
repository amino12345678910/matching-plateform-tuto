'use server';
import {prisma as dbContext} from '@/lib/prisma';

export const getMySchedule = async () => {
  const timing = await dbContext.booking.findMany({
    where: {NOT: {acceptedAt: null}},
    select: {
      id: true,
      acceptedAt: true,
      delivery: true,
    },
  });

  return {timing, success: true};
};
