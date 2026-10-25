import {prisma as dbContext} from '@/lib/prisma';
import {readCloudStore} from '@/lib/cloud-store';

export const getCurrentClientStats = async (freelancerId: string) => {
  try {
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
  } catch {
    const store = readCloudStore();
    const b = store.bookings.find(item => item.freelancerId === freelancerId);
    if (!b) return null;
    return {
      client: {
        id: b.clientId,
        name: b.clientName,
        clientConversations: [{id: `conv_${b.id}`}],
      },
      acceptedAt: new Date(b.createdAt),
      delivery: b.delivery,
      totalPrice: b.totalPrice,
      servicePackageTier: b.servicePackageTier,
      service: {title: b.serviceTitle},
    };
  }
};
