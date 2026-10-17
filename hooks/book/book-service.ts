'use server';
import type {User} from '@/generated/prisma';
import {prisma as dbContext} from '@/lib/prisma';
import type {ServicePackage} from '@/types/service';
import {cookies} from 'next/headers';
import {buildBookingMessage} from './build-booking-message';
import {createNotifications} from '../notification';
import {revalidatePath} from 'next/cache';

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
  insufficientPoints?: boolean;
  requiredPoints?: number;
  currentPoints?: number;
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
  if (role !== 'USER') {
    return {
      success: false,
      message: undefined,
      error: 'Vous devez utiliser un compte Élève (Student) pour réserver un cours.',
    };
  }

  const priceInPoints = Math.ceil(Number(packagePrice || 0));

  const student = await dbContext.user.findUnique({
    where: {id: clientId},
    select: {points: true},
  });

  const currentPoints = student?.points ?? 0;

  if (currentPoints < priceInPoints) {
    return {
      success: false,
      insufficientPoints: true,
      requiredPoints: priceInPoints,
      currentPoints,
      error: `Solde insuffisant : vous avez ${currentPoints} Pts (${currentPoints} DT), mais ce cours coûte ${priceInPoints} Pts (${priceInPoints} DT). Rechargez vos points !`,
    };
  }

  const cookiesdata = {
    serviceId: serviceId,
    packageName: packageName,
  };
  (await cookies()).set('X-booked-service', JSON.stringify(cookiesdata));

  // Deduct points from student & record transaction
  await dbContext.user.update({
    where: {id: clientId},
    data: {
      points: {decrement: priceInPoints},
      pointTransactions: {
        create: {
          amount: -priceInPoints,
          type: 'BOOKING',
          description: `Réservation cours : "${serviceName}" (Pack ${packageName} — ${priceInPoints} DT)`,
        },
      },
    },
  });

  // Credit points to tutor & record transaction
  await dbContext.user.update({
    where: {id: freelancerId},
    data: {
      points: {increment: priceInPoints},
      pointTransactions: {
        create: {
          amount: priceInPoints,
          type: 'EARNING',
          description: `Revenu cours réservé par ${clientName} : "${serviceName}" (${priceInPoints} DT)`,
        },
      },
    },
  });

  const booking = await dbContext.booking.create({
    data: {
      servicePackageTier: packageName,
      status: 'PENDING',
      revisions,
      delivery,
      totalPrice: priceInPoints,
      clientId,
      sellerId,
      serviceId,
      freelancerId,
    },
  });

  const getRoom = (a: string, b: string) => {
    return [a, b].sort().join('--');
  };

  const roomId = getRoom(clientId, freelancerId);

  await dbContext.conversation.upsert({
    where: {id: roomId},
    update: {
      bookingId: booking.id,
      messages: {
        create: {
          senderId: clientId,
          text: buildBookingMessage({clientName, delivery, packageName, revisions, serviceName}),
          contentType: 'AUTOMATED',
          createdAt: new Date(),
        },
      },
    },
    create: {
      id: roomId,
      bookingId: booking.id,
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

  await createNotifications([
    {
      userId: clientId,
      title: `Cours réservé : "${serviceName}" (-${priceInPoints} Points / ${priceInPoints} DT).`,
      type: 'ORDER',
      link: `/dashboard/client/bookings`,
    },
    {
      userId: freelancerId,
      title: `Nouvelle réservation de ${clientName} (+${priceInPoints} Pts / ${priceInPoints} DT).`,
      type: 'ORDER',
      link: `/dashboard/freelancer/bookings`,
    },
  ]);

  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/client/bookings');
  revalidatePath('/dashboard/client/points');
  revalidatePath('/dashboard/freelancer');
  revalidatePath('/admin');

  return {
    success: true,
    message: `Mabrouk ! Cours réservé avec ${priceInPoints} Points (${priceInPoints} DT). Le professeur vous répondra très vite !`,
    error: undefined,
  };
};
