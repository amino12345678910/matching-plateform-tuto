import {prisma as dbContext} from '@/lib/prisma';
import {readCloudStore} from '@/lib/cloud-store';

export const getRevenue = async (freelancerId: string, days = 30) => {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const bookings = await dbContext.booking.findMany({
      where: {freelancerId, createdAt: {gte: sinceDate}, status: 'COMPLETED'},
      select: {totalPrice: true},
    });

    return bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  } catch {
    const store = readCloudStore();
    return store.bookings
      .filter(b => b.freelancerId === freelancerId && b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + b.totalPrice, 0);
  }
};
