'use server';
import type {User} from '@/generated/prisma';
import {prisma as dbContext} from '@/lib/prisma';
import type {ServicePackage} from '@/types/service';
import {cookies} from 'next/headers';
import {buildBookingMessage} from './build-booking-message';
import {createNotifications} from '../notification';
import {revalidatePath} from 'next/cache';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
import {getCloudSessionCookie, setCloudSessionCookie} from '@/hooks/auth/cloud-auth';
import {
  saveClientBookingCookie,
  saveClientTransactionCookie,
  saveClientNotificationCookie,
} from '@/hooks/book/bookings-store';
import {formatScheduleLabel, getServiceMeetInfo} from '@/lib/google-meet';

export type BookServiceProps = {
  serviceName: string;
  packageName: ServicePackage['name'];
  packagePrice: ServicePackage['price'];
  revisions: ServicePackage['revisions'];
  delivery: ServicePackage['delivery'];
  role: User['role'] | string;
  sellerId: string;
  serviceId: string;
  serviceSlug: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  meetUrl?: string;
  tutorPhone?: string;
};

type BookServiceReturnType = {
  error?: string;
  message?: string;
  success: boolean;
  insufficientPoints?: boolean;
  requiredPoints?: number;
  currentPoints?: number;
  newBalance?: number;
  bookingId?: string;
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
  freelancerName,
  scheduledDate,
  scheduledTime,
  meetUrl,
  tutorPhone,
}: BookServiceProps): Promise<BookServiceReturnType> => {
  if (role !== 'USER' && role !== 'ADMIN') {
    return {
      success: false,
      message: undefined,
      error: 'Vous devez utiliser un compte Élève (Student) pour réserver un cours.',
    };
  }

  const priceInPoints = Math.ceil(Number(packagePrice || 0));
  const cloudSession = await getCloudSessionCookie();
  const store = readCloudStore();
  let cloudStudent = store.users.find(u => u.id === clientId);

  let currentPoints = cloudSession?.points ?? cloudStudent?.points ?? 50;

  try {
    const student = await dbContext.user.findUnique({
      where: {id: clientId},
      select: {points: true},
    });
    if (student && typeof student.points === 'number') {
      currentPoints = student.points;
    }
  } catch {
    // Cloud fallback
  }

  if (currentPoints < priceInPoints) {
    return {
      success: false,
      insufficientPoints: true,
      requiredPoints: priceInPoints,
      currentPoints,
      error: `Solde insuffisant : vous avez ${currentPoints} Pts (${currentPoints} DT), mais ce cours coûte ${priceInPoints} Pts (${priceInPoints} DT). Rechargez vos points !`,
    };
  }

  const newBalance = currentPoints - priceInPoints;
  const meetInfo = getServiceMeetInfo({
    slug: serviceSlug,
    title: serviceName,
    scheduledDate,
    scheduledTime,
    meetLink: meetUrl,
  });
  const finalDate = scheduledDate || meetInfo.scheduledDate;
  const finalTime = scheduledTime || meetInfo.scheduledTime;
  const finalMeetUrl = meetUrl || meetInfo.meetUrl;
  const scheduleLabel = formatScheduleLabel(finalDate, finalTime);

  try {
    const cookiesdata = {
      serviceId: serviceId,
      packageName: packageName,
    };
    (await cookies()).set('X-booked-service', JSON.stringify(cookiesdata));

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
        status: 'CONFIRMED',
        revisions,
        delivery,
        totalPrice: priceInPoints,
        clientId,
        sellerId,
        serviceId,
        freelancerId,
      },
    });

    const getRoom = (a: string, b: string) => [a, b].sort().join('--');
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
  } catch {
    // Cloud fallback
  }

  // Always update Cloud Store & Cookies so Vercel serverless persists booking, points, transactions & notifications
  const now = new Date().toISOString();
  if (!cloudStudent && cloudSession) {
    cloudStudent = {
      id: cloudSession.userId,
      name: cloudSession.name,
      email: cloudSession.email,
      role: cloudSession.role,
      points: newBalance,
      image: cloudSession.image ?? null,
      imageSource: cloudSession.imageSource || 'NULL',
      hasPassword: true,
      emailVerified: true,
      createdAt: cloudSession.createdAt || now,
    };
    store.users.unshift(cloudStudent);
  } else if (cloudStudent) {
    cloudStudent.points = newBalance;
  }

  const cloudTutor = store.users.find(u => u.id === freelancerId);
  if (cloudTutor) {
    cloudTutor.points = (cloudTutor.points || 0) + priceInPoints;
  }

  const displayTutorName = freelancerName || cloudTutor?.name || 'Professeur 9arrini';
  const bookingId = `bk_${Date.now()}`;

  const txRecord = {
    id: `tx_book_${Date.now()}`,
    userId: clientId,
    amount: -priceInPoints,
    type: 'BOOKING_PAYMENT' as const,
    description: `Réservation cours : "${serviceName}" (Pack ${packageName} — ${priceInPoints} DT)`,
    createdAt: now,
  };

  const newBooking = {
    id: bookingId,
    serviceId,
    serviceTitle: serviceName,
    serviceSlug,
    clientId,
    clientName,
    clientEmail: cloudStudent?.email || cloudSession?.email || 'eleve@9arrini.tn',
    freelancerId,
    freelancerName: displayTutorName,
    sellerId,
    servicePackageTier: packageName,
    totalPrice: priceInPoints,
    delivery,
    revisions,
    status: 'CONFIRMED' as const,
    scheduledDate: finalDate,
    scheduledTime: finalTime,
    meetUrl: finalMeetUrl,
    tutorPhone: tutorPhone || '+216 22 410 112',
    createdAt: now,
  };

  await saveClientBookingCookie(newBooking);
  await saveClientTransactionCookie(txRecord);
  await saveClientNotificationCookie([
    {
      id: `notif_bk_${Date.now()}_1`,
      userId: clientId,
      title: `✅ Séance réservée & payée : "${serviceName}" (-${priceInPoints} Points / ${priceInPoints} DT). Nouveau solde : ${newBalance} Pts.`,
      type: 'ORDER',
      link: '/dashboard/client/bookings',
      read: false,
      createdAt: now,
    },
    {
      id: `rem_${bookingId}`,
      userId: clientId,
      title: `⏰ Rappel de cours : "${serviceName}" avec ${displayTutorName} — Prévu le ${scheduleLabel}. Lien Google Meet : ${finalMeetUrl}`,
      type: 'ORDER',
      link: '/dashboard/client/bookings',
      read: false,
      createdAt: now,
    },
  ]);

  store.transactions.unshift(txRecord);
  store.bookings.unshift(newBooking);
  writeCloudStore(store);

  if (cloudSession) {
    await setCloudSessionCookie({
      ...cloudSession,
      points: newBalance,
    });
  }

  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/client/bookings');
  revalidatePath('/dashboard/client/points');
  revalidatePath('/dashboard/freelancer');
  revalidatePath('/notification');
  revalidatePath(`/service/${serviceSlug}`);

  return {
    success: true,
    newBalance,
    bookingId,
    message: `Mabrouk ! Séance réservée (${scheduleLabel}) avec ${priceInPoints} Points (${priceInPoints} DT). Retrouvez-la dans vos Cours Réservés et vos Notifications !`,
    error: undefined,
  };
};
