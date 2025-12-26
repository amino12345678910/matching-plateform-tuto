import type {ClientActiveOrder} from '@/app/(freelancer-client)/dashboard/client/page';
import {prisma as dbContext} from '@/lib/prisma';
import {getUserInfo} from '../shared/get-user-info';

export const getActiveOrders = async (): Promise<ClientActiveOrder> => {
  const {userId} = await getUserInfo();
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
};
