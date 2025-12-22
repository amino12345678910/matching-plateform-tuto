import {prisma as dbContext} from '@/lib/prisma';

export const getCurrentClientStats = async (freelancerId: string) => {
  const pendingBookings = await dbContext.booking.findFirst({
    orderBy: {acceptedAt: 'desc'},
    take: 1,
    where: {
      freelancerId,
      status: 'CONFIRMED',
    },
    select: {
      client: {
        select: {
          id: true,
          name: true,
          clientConversations: {
            where: {freelancerId},
            select: {id: true},
          },
        },
      },
      acceptedAt: true,
      delivery: true,
      totalPrice: true,
      servicePackageTier: true,
      service: {select: {title: true}},
    },
  });
  return pendingBookings;
};
