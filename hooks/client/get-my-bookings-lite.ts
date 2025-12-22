import {prisma as dbContext} from '@/lib/prisma';
import {type UserInfo} from '../get-user-info';
import type {BookingLite} from '@/types/bookings-lite';

async function getMyBookingsLite({user}: {user: UserInfo}): Promise<BookingLite[]> {
  const bookings = await dbContext.booking.findMany({
    where: {userId: user.userId},
    orderBy: {updatedAt: 'desc'},
    select: {
      id: true,
      servicePackageTier: true,
      status: true,
      createdAt: true,
      service: {
        select: {
          title: true,
          slug: true,
          packages: {
            select: {name: true, delivery: true, revisions: true, price: true},
          },
        },
      },
      seller: {select: {user: {select: {id: true, email: true, name: true}}}},
    },
  });
  return bookings;
}
export {getMyBookingsLite};
