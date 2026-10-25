'use server';
import {prisma as dbContext} from '@/lib/prisma';
import {readCloudStore} from '@/lib/cloud-store';

export const getMySchedule = async ({fId}: {fId: string}) => {
  try {
    const timing = await dbContext.booking.findMany({
      where: {freelancerId: fId, NOT: {acceptedAt: null}},
      select: {
        id: true,
        acceptedAt: true,
        delivery: true,
      },
    });

    return {timing, success: true};
  } catch {
    const store = readCloudStore();
    const timing = store.bookings
      .filter(b => b.freelancerId === fId && b.status !== 'CANCELLED')
      .map(b => ({
        id: b.id,
        acceptedAt: new Date(b.createdAt),
        delivery: b.delivery,
      }));
    return {timing, success: true};
  }
};
