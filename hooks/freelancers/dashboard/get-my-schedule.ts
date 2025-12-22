'use server';
import {prisma as dbContext} from '@/lib/prisma';

export const getMySchedule = async ({fId}: {fId: string}) => {
  const timing = await dbContext.booking.findMany({
    where: {freelancerId: fId, NOT: {acceptedAt: null}},
    select: {
      id: true,
      acceptedAt: true,
      delivery: true,
    },
  });

  return {timing, success: true};
};
