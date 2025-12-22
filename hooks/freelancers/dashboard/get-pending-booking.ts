import {prisma as dbContext} from '@/lib/prisma';

export const getPendingBookings = async (freelancerId: string) => {
  const pendingBookings = await dbContext.booking.findMany({
    where: {freelancerId, status: 'PENDING'},
    select: {client: {select: {name: true}}},
  });

  return pendingBookings.map(booking => booking.client);
};
