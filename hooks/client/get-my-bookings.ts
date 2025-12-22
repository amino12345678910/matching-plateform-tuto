import {prisma as dbContext} from '@/lib/prisma';
import {type UserInfo} from '../get-user-info';
import type {BookedServiceType} from '@/types/bookings';

async function getMyBookings({user}: {user: UserInfo}): Promise<BookedServiceType[]> {
  const bookings = await dbContext.booking.findMany({
    where: {clientId: user.userId},
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
          packages: {select: {name: true, price: true, delivery: true}},
          freelancer: {select: {imageSource: true, image: true, email: true, id: true, name: true}},
        },
      },
    },
    orderBy: {updatedAt: 'desc'},
  });

  const services = bookings.map(booking => ({...booking.service, hasSeen: booking.hasSeen}));
  return services.map(s => ({
    ...s,
    hasSeen: s.hasSeen ?? undefined,
    images: s.images ?? [],
    freelancer: {...s.freelancer, image: s.freelancer.image ?? undefined},
  }));
}
export {getMyBookings};
