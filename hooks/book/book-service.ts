'use server';
import type {User} from '@/generated/prisma';
import {prisma as dbContext} from '@/lib/prisma';
import type {ServicePackage} from '@/types/service';
import {cookies} from 'next/headers';
import {buildBookingMessage} from './build-booking-message';
import {createNotifications} from '../notification';

export type BookServiceProps = {
  serviceName: string;
  packageName: ServicePackage['name'];
  packagePrice: ServicePackage['price'];
  revisions: ServicePackage['revisions'];
  delivery: ServicePackage['delivery'];
  role: User['role'];
  sellerId: string;
  serviceId: string;
  serviceSlug: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
};

type BookServiceReturnType = {
  error?: string;
  message?: string;
  success: boolean;
};

export const bookService = async ({
  serviceName,
  packageName,
  packagePrice,
  revisions,
  delivery,
  role,
  serviceId,
  sellerId,
  serviceSlug,
  clientId,
  clientName,
  freelancerId,
}: BookServiceProps): Promise<BookServiceReturnType> => {
  if (role !== 'USER')
    return {success: false, message: undefined, error: 'You must be a user to start booking'};
  const cookiesdata = {
    serviceId: serviceId,
    packageName: packageName,
  };
  (await cookies()).set('X-booked-service', JSON.stringify(cookiesdata));
  const prisma = await dbContext.booking.create({
    data: {
      servicePackageTier: packageName,
      status: 'PENDING',
      revisions,
      delivery,
      totalPrice: packagePrice || 0,
      //imp columns
      clientId,
      sellerId,
      serviceId,
      freelancerId,
    },
  });

  console.log('create booking: payload: ', prisma);

  if (prisma.serviceId.length < 0) {
    return {
      error: 'Booking invalid',
      success: false,
      message: undefined,
    };
  }

  const getRoom = (a: string, b: string) => {
    return [a, b].sort().join('--');
  };

  const convo = await dbContext.conversation.create({
    data: {
      id: getRoom(clientId, freelancerId),
      bookingId: prisma.id,
      clientId: clientId,
      freelancerId,
      messages: {
        create: {
          senderId: clientId,
          text: buildBookingMessage({clientName, delivery, packageName, revisions, serviceName}),
          contentType: 'AUTOMATED',
          createdAt: new Date(),
        },
      },
    },
  });

  // console.log('create convo: payload: ', convo);

  if (!convo.id) {
    return {
      error: 'Conversation invalid',
      success: false,
      message: undefined,
    };
  }

  await createNotifications([
    {
      userId: clientId,
      title: `Booking placed for "${serviceName}".`,
      type: 'ORDER',
      link: `/service/${serviceSlug}`,
    },
    {
      userId: freelancerId,
      title: `New booking from ${clientName}.`,
      type: 'ORDER',
      link: `/dashboard/freelancer/bookings`,
    },
  ]);

  return {
    success: true,
    message: 'Booking request has been send, Please wait until Seller responds',
    error: undefined,
  };
};
