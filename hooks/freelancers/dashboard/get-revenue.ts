import {prisma as dbContext} from '@/lib/prisma';

export const getRevenue = async (freelancerId: string, days = 30) => {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  const bookings = await dbContext.booking.findMany({
    where: {freelancerId, createdAt: {gte: sinceDate}, status: 'COMPLETED'},
    select: {totalPrice: true},
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  return totalRevenue;
};
