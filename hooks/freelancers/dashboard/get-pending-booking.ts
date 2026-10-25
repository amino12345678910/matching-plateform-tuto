import {prisma as dbContext} from '@/lib/prisma';
import {readCloudStore} from '@/lib/cloud-store';

export const getPendingBookings = async (freelancerId: string) => {
  try {
    const pendingBookings = await dbContext.booking.findMany({
      where: {freelancerId, status: 'PENDING'},
      select: {client: {select: {name: true}}},
    });

    return pendingBookings.map(booking => booking.client);
  } catch {
    const store = readCloudStore();
    return store.bookings
      .filter(b => b.freelancerId === freelancerId && b.status === 'PENDING')
      .map(b => ({name: b.clientName}));
  }
};
