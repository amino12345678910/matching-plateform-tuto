import {prisma as dbContext} from '@/lib/prisma';
import {type UserInfo} from './get-user-info';
import type {BookedServiceType} from '@/types/bookings';

type Role = 'CLIENT' | 'FREELANCER';

async function getMyBookings({
  user,
  role = 'CLIENT',
}: {
  user: UserInfo;
  role?: Role;
}): Promise<BookedServiceType[]> {
  const isClient = role === 'CLIENT';

  const bookings = await dbContext.booking.findMany({
    where: isClient ? {clientId: user.userId} : {freelancerId: user.userId},

    select: {
      hasSeen: true,

      service: {
        select: {
          id: true,
          title: true,
          slug: true,
          images: true,
          status: true,
          updatedAt: true,

          packages: {
            select: {
              name: true,
              price: true,
              delivery: true,
            },
          },

          freelancer: isClient
            ? {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  imageSource: true,
                },
              }
            : false,
        },
      },

      client: !isClient
        ? {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              imageSource: true,
            },
          }
        : false,
    },

    orderBy: {updatedAt: 'desc'},
  });

  return bookings.map(booking => {
    const service = booking.service;

    return {
      ...service,
      hasSeen: booking.hasSeen ?? undefined,
      images: service.images ?? [],
      counterparty: isClient
        ? {
            ...service.freelancer,
            image: service.freelancer.image ?? undefined,
          }
        : {
            ...booking.client,
            image: booking.client.image ?? undefined,
          },
    };
  });
}

export {getMyBookings};
