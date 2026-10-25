import type {ClientActiveOrder} from '@/app/(freelancer-client)/dashboard/client/page';
import {prisma as dbContext} from '@/lib/prisma';
import {getUserInfo} from '../shared/get-user-info';
import {readCloudStore} from '@/lib/cloud-store';

export const getActiveOrders = async (): Promise<ClientActiveOrder> => {
  const {userId} = await getUserInfo();
  if (!userId) return undefined as unknown as ClientActiveOrder;

  try {
    const activeOrders = await dbContext.booking.findMany({
      where: {status: 'CONFIRMED', clientId: userId},
      select: {
        id: true,
        service: {select: {title: true}},
        freelancer: {
          select: {
            id: true,
            name: true,
            freelancerConversations: {select: {id: true}},
          },
        },
        totalPrice: true,
        acceptedAt: true,
        delivery: true,
        status: true,
      },
    });

    if (activeOrders.length > 0) {
      return activeOrders.map(order => ({
        id: order.id,
        service: order.service,
        freelancer: {
          id: order.freelancer.id,
          name: order.freelancer.name,
          conversations: order.freelancer.freelancerConversations,
        },
        totalPrice: order.totalPrice,
        acceptedAt: order.acceptedAt,
        delivery: order.delivery,
        status: order.status,
      }))[0];
    }
  } catch {
    // Cloud fallback
  }

  const store = readCloudStore();
  const cloudBooking = store.bookings.find(b => b.clientId === userId);
  if (cloudBooking) {
    return {
      id: cloudBooking.id,
      service: {title: cloudBooking.serviceTitle},
      freelancer: {
        id: cloudBooking.freelancerId,
        name: cloudBooking.freelancerName,
        conversations: [{id: `conv_${cloudBooking.id}`}],
      },
      totalPrice: cloudBooking.totalPrice,
      acceptedAt: new Date(cloudBooking.createdAt),
      delivery: cloudBooking.delivery,
      status: cloudBooking.status,
    };
  }

  return undefined as unknown as ClientActiveOrder;
};
