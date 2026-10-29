'use server';
import type {User} from '@/generated/prisma';
import {prisma as dbContext} from '@/lib/prisma';
import type {ServicePackage} from '@/types/service';
import {cookies} from 'next/headers';
import {buildBookingMessage} from './build-booking-message';
import {revalidatePath} from 'next/cache';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
import {getCloudSessionCookie, setCloudSessionCookie} from '@/hooks/auth/cloud-auth';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {
  getAllRealServices,
  getClientBookingsCookie,
  saveClientBookingCookie,
  saveClientTransactionCookie,
  saveClientNotificationCookie,
  saveReviewCookie,
} from '@/hooks/book/bookings-store';
import {formatScheduleLabel, getServiceMeetInfo} from '@/lib/google-meet';
import {createRealGoogleMeetAutomatically} from '@/lib/google-calendar-meet';
import {
  FREE_TRIAL_DEFAULT_ACTIVE,
  splitCommission,
} from '@/lib/constants';

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
  isFreeTrial?: boolean;
};

export const bookService = async ({
  serviceName,
  packageName,
  packagePrice,
  revisions,
  delivery,
  serviceId,
  sellerId,
  serviceSlug,
  freelancerId,
  freelancerName,
  scheduledDate,
  scheduledTime,
  meetUrl,
  tutorPhone,
}: BookServiceProps): Promise<BookServiceReturnType> => {
  // 1. Verify authenticated user on the server
  const sessionUser = await getUserInfo();
  if (!sessionUser?.userId) {
    return {
      success: false,
      error: 'Veuillez vous connecter pour réserver ce cours.',
    };
  }

  const clientId = sessionUser.userId;
  const clientName = sessionUser.name || 'Élève 9arrini';
  const role = sessionUser.role;

  if (role !== 'USER' && role !== 'ADMIN') {
    return {
      success: false,
      message: undefined,
      error: 'Vous devez utiliser un compte Élève pour réserver un cours.',
    };
  }

  if (freelancerId && freelancerId === clientId) {
    return {
      success: false,
      error: 'Vous ne pouvez pas réserver votre propre cours.',
    };
  }

  // 2. Resolve authoritative package price on the server
  let serverPackagePrice: number | null = null;
  try {
    const dbService = await dbContext.service.findFirst({
      where: {
        OR: [{id: serviceId}, ...(serviceSlug ? [{slug: serviceSlug}] : [])],
      },
      include: {packages: true},
    });
    const matchedPkg =
      dbService?.packages.find(p => p.name === packageName) || dbService?.packages[0];
    if (matchedPkg && typeof matchedPkg.price === 'number') {
      serverPackagePrice = matchedPkg.price;
    }
  } catch {
    // Cloud fallback
  }

  if (serverPackagePrice === null) {
    try {
      const realServices = await getAllRealServices();
      const matchedService = realServices.find(
        s => s.id === serviceId || (serviceSlug && s.slug === serviceSlug)
      );
      const matchedPkg =
        matchedService?.packages?.find(
          (p: {name: string; price: number}) => p.name === packageName
        ) || matchedService?.packages?.[0];
      if (matchedPkg && typeof matchedPkg.price === 'number') {
        serverPackagePrice = matchedPkg.price;
      }
    } catch {
      // ignore
    }
  }

  const catalogPrice = Math.max(1, Math.ceil(Number(serverPackagePrice ?? packagePrice ?? 15)));

  const cloudSession = await getCloudSessionCookie();
  const store = readCloudStore();
  let cloudStudent = store.users.find(u => u.id === clientId);

  const isFreeTrial = store.freeTrialActive ?? FREE_TRIAL_DEFAULT_ACTIVE;
  const priceInPoints = isFreeTrial ? 0 : catalogPrice;
  const {platformFee, tutorEarning} = isFreeTrial
    ? {platformFee: 0, tutorEarning: 0}
    : splitCommission(priceInPoints);

  let currentPoints = cloudSession?.points ?? cloudStudent?.points ?? 0;

  // Prevent duplicate active booking for the same course
  try {
    const existingCookieBookings = await getClientBookingsCookie(clientId);
    const alreadyInCookie = existingCookieBookings.some(
      b =>
        b.clientId === clientId &&
        b.status !== 'CANCELLED' &&
        (b.serviceId === serviceId || (serviceSlug && b.serviceSlug === serviceSlug))
    );
    const alreadyInStore = (store.bookings || []).some(
      b =>
        b.clientId === clientId &&
        b.status !== 'CANCELLED' &&
        (b.serviceId === serviceId || (serviceSlug && b.serviceSlug === serviceSlug))
    );
    if (alreadyInCookie || alreadyInStore) {
      return {
        success: true,
        newBalance: currentPoints,
        isFreeTrial,
        message: 'Vous êtes déjà inscrit(e) à ce cours ! Votre lien Google Meet est actif.',
      };
    }
  } catch {
    // ignore
  }

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

  if (!isFreeTrial && currentPoints < priceInPoints) {
    return {
      success: false,
      insufficientPoints: true,
      requiredPoints: priceInPoints,
      currentPoints,
      error: `Solde insuffisant : vous avez ${currentPoints} DT et cette séance coûte ${priceInPoints} DT.`,
    };
  }

  const bookingMessage = buildBookingMessage({
    clientName,
    serviceName,
    packageName,
    revisions,
    delivery,
  });

  const now = new Date().toISOString();
  const bookingId = `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const newBalance = Math.max(0, currentPoints - priceInPoints);

  // 1. Try syncing with Prisma if reachable
  try {
    await dbContext.$transaction(async tx => {
      if (!isFreeTrial && priceInPoints > 0) {
        await tx.user.update({
          where: {id: clientId},
          data: {
            points: {decrement: priceInPoints},
            pointTransactions: {
              create: {
                amount: -priceInPoints,
                type: 'BOOKING_PAYMENT',
                description: `Séquestre réservation "${serviceName}" (${packageName}) — libéré au professeur après votre évaluation`,
              },
            },
          },
        });
      }

      await tx.booking.create({
        data: {
          id: bookingId,
          serviceId,
          sellerId,
          clientId,
          freelancerId,
          servicePackageTier: packageName,
          totalPrice: priceInPoints,
          delivery,
          revisions,
          status: 'CONFIRMED',
        },
      });
    });
  } catch {
    // Cloud fallback
  }

  // 2. Always persist in Cloud Store + Signed Session Cookie + Bookings Cookie
  if (!cloudStudent) {
    cloudStudent = {
      id: clientId,
      name: clientName,
      email: cloudSession?.email || sessionUser.email || '',
      role: 'USER',
      points: newBalance,
      image: cloudSession?.image ?? null,
      imageSource: cloudSession?.imageSource || 'NULL',
      hasPassword: true,
      emailVerified: true,
      studentLevel: sessionUser.studentLevel ?? null,
      studentGrade: sessionUser.studentGrade ?? null,
      city: sessionUser.city ?? null,
      createdAt: cloudSession?.createdAt || now,
    };
    store.users.unshift(cloudStudent);
  } else {
    cloudStudent.points = newBalance;
  }

  let resolvedMeetUrl = meetUrl;
  if (!resolvedMeetUrl || !resolvedMeetUrl.startsWith('https://meet.google.com/')) {
    const autoGoogleMeet = await createRealGoogleMeetAutomatically({
      title: serviceName,
      scheduledDate,
      scheduledTime,
    });
    if (autoGoogleMeet) {
      resolvedMeetUrl = autoGoogleMeet;
    }
  }

  const resolvedMeetInfo = getServiceMeetInfo({
    slug: serviceSlug,
    title: serviceName,
    scheduledDate,
    scheduledTime,
    meetLink: resolvedMeetUrl,
  });

  const resolvedTutorName =
    freelancerName || store.users.find(u => u.id === freelancerId)?.name || 'Professeur 9arrini';

  const newBooking = {
    id: bookingId,
    serviceId,
    serviceTitle: serviceName,
    serviceSlug: serviceSlug || serviceId,
    clientId,
    clientName,
    clientEmail: cloudStudent.email || sessionUser.email || '',
    clientLevel: sessionUser.studentLevel || undefined,
    clientGrade: sessionUser.studentGrade || undefined,
    freelancerId,
    freelancerName: resolvedTutorName,
    sellerId,
    servicePackageTier: packageName as 'BASIC' | 'STANDARD' | 'PREMIUM',
    totalPrice: priceInPoints,
    originalPrice: catalogPrice,
    isFreeTrial,
    platformFee,
    tutorEarning,
    payoutStatus: (isFreeTrial ? 'FREE_TRIAL' : 'HELD') as
      | 'HELD'
      | 'RELEASED'
      | 'REFUNDED'
      | 'DISPUTED'
      | 'FREE_TRIAL',
    studentConfirmed: false,
    delivery,
    revisions,
    status: 'CONFIRMED' as const,
    scheduledDate: resolvedMeetInfo.scheduledDate,
    scheduledTime: resolvedMeetInfo.scheduledTime,
    meetUrl: resolvedMeetInfo.meetUrl,
    tutorPhone: tutorPhone || undefined,
    createdAt: now,
  };

  const scheduleStr = formatScheduleLabel(
    resolvedMeetInfo.scheduledDate,
    resolvedMeetInfo.scheduledTime
  );

  const clientConfirmNotif = {
    id: `notif_book_${bookingId}`,
    userId: clientId,
    title: isFreeTrial
      ? `🎉 Séance réservée gratuitement (Semaine de lancement) : "${serviceName}" avec ${resolvedTutorName} (${scheduleStr}). Après la séance, notez le professeur pour valider le cours !`
      : `✅ Séance réservée : "${serviceName}" (${priceInPoints} DT en séquestre). Après la séance, notez le professeur pour débloquer son paiement !`,
    type: 'ORDER' as const,
    link: '/dashboard/client/bookings',
    read: false,
    createdAt: now,
  };

  const tutorNotif = {
    id: `notif_tutor_${bookingId}`,
    userId: freelancerId,
    title: `🎓 Nouvelle inscription d'élève : ${clientName} a réservé "${serviceName}" (${packageName}) pour le ${scheduleStr}.`,
    type: 'ORDER' as const,
    link: '/dashboard/freelancer/orders',
    read: false,
    createdAt: now,
  };

  await saveClientBookingCookie(newBooking);
  if (!isFreeTrial && priceInPoints > 0) {
    const studentTx = {
      id: `tx_book_${bookingId}`,
      userId: clientId,
      amount: -priceInPoints,
      type: 'BOOKING_PAYMENT' as const,
      description: `Séquestre cours "${serviceName}" (${packageName}) — libéré après votre avis`,
      createdAt: now,
    };
    await saveClientTransactionCookie(studentTx);
    store.transactions.unshift(studentTx);
  }
  await saveClientNotificationCookie([clientConfirmNotif]);

  store.bookings.unshift(newBooking);
  if (!Array.isArray(store.notifications)) store.notifications = [];
  store.notifications.unshift(clientConfirmNotif, tutorNotif);

  if (!Array.isArray(store.messages)) store.messages = [];
  store.messages.push({
    id: `msg_${bookingId}`,
    roomId: [clientId, freelancerId].sort().join('--'),
    senderId: clientId,
    senderName: clientName,
    recipientId: freelancerId,
    recipientName: resolvedTutorName,
    text: bookingMessage,
    createdAt: now,
  });

  writeCloudStore(store);

  if (cloudSession) {
    await setCloudSessionCookie({
      ...cloudSession,
      points: newBalance,
    });
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set('booking_message', bookingMessage, {
      path: '/',
      httpOnly: false,
      maxAge: 60,
    });
  } catch {
    // ignore
  }

  revalidatePath(`/service/${serviceSlug}`);
  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/client/bookings');
  revalidatePath('/dashboard/client/points');
  revalidatePath('/dashboard/freelancer');
  revalidatePath('/dashboard/freelancer/orders');
  revalidatePath('/notification');
  revalidatePath('/admin');

  return {
    success: true,
    newBalance,
    bookingId,
    isFreeTrial,
    message: isFreeTrial
      ? `Séance réservée gratuitement (Offre de lancement 1 semaine) ! Après la séance, pensez à évaluer votre professeur.`
      : `Cours réservé ! ${priceInPoints} DT sont conservés en garantie et seront versés au professeur dès votre évaluation après la séance.`,
  };
};

/**
 * Student confirms the session took place and rates the tutor (1-5 stars + comment).
 * This releases the tutor's earnings (85%) from escrow (or marks the free-trial session as verified).
 */
export async function confirmAndRateSession(input: {
  bookingId?: string;
  serviceId: string;
  serviceSlug?: string;
  rating: number;
  comment: string;
  quality?: number;
  communication?: number;
  behavior?: number;
  professionalism?: number;
}) {
  const sessionUser = await getUserInfo();
  if (!sessionUser?.userId) {
    return {success: false, error: 'Veuillez vous connecter pour évaluer la séance.'};
  }

  const cleanRating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5)));
  const cleanComment = (input.comment || '').trim();
  if (cleanComment.length < 5) {
    return {
      success: false,
      error: 'Veuillez écrire un court commentaire (minimum 5 caractères) sur le déroulement de la séance.',
    };
  }

  const now = new Date().toISOString();
  const store = readCloudStore();
  const cookieBookings = await getClientBookingsCookie(sessionUser.userId);

  // Locate the booking in Cloud Store or Cookie
  let targetBooking = store.bookings.find(
    b =>
      (input.bookingId && b.id === input.bookingId) ||
      (b.clientId === sessionUser.userId &&
        (b.serviceId === input.serviceId ||
          (input.serviceSlug && b.serviceSlug === input.serviceSlug)))
  );

  const cookieMatch = cookieBookings.find(
    b =>
      (input.bookingId && b.id === input.bookingId) ||
      (b.clientId === sessionUser.userId &&
        (b.serviceId === input.serviceId ||
          (input.serviceSlug && b.serviceSlug === input.serviceSlug)))
  );

  if (!targetBooking && cookieMatch) {
    targetBooking = {...cookieMatch};
    store.bookings.unshift(targetBooking);
  }

  if (!targetBooking) {
    return {
      success: false,
      error: 'Aucune réservation trouvée pour ce cours.',
    };
  }

  if (targetBooking.studentConfirmed) {
    return {
      success: true,
      message: 'Cette séance a déjà été confirmée et évaluée. Merci !',
    };
  }

  const isFreeTrial = Boolean(targetBooking.isFreeTrial || targetBooking.totalPrice === 0);
  const {tutorEarning, platformFee} = isFreeTrial
    ? {tutorEarning: 0, platformFee: 0}
    : splitCommission(targetBooking.totalPrice);

  targetBooking.status = 'COMPLETED';
  targetBooking.studentConfirmed = true;
  targetBooking.studentRating = cleanRating;
  targetBooking.studentReview = cleanComment;
  targetBooking.completedAt = now;
  targetBooking.releasedAt = now;
  targetBooking.tutorEarning = tutorEarning;
  targetBooking.platformFee = platformFee;
  targetBooking.payoutStatus = isFreeTrial ? 'FREE_TRIAL' : 'RELEASED';

  // Release escrow to tutor if paid session
  if (!isFreeTrial && tutorEarning > 0 && targetBooking.freelancerId) {
    let cloudTutor = store.users.find(u => u.id === targetBooking!.freelancerId);
    if (cloudTutor) {
      cloudTutor.points = (cloudTutor.points || 0) + tutorEarning;
    }
    store.transactions.unshift({
      id: `tx_earn_${targetBooking.id}`,
      userId: targetBooking.freelancerId,
      amount: tutorEarning,
      type: 'EARNING',
      description: `Paiement débloqué après avis élève (${cleanRating}★) — "${targetBooking.serviceTitle}" (85% net prof, 15% commission 9arrini)`,
      createdAt: now,
    });
  }

  // Save review so it appears on the course page and tutor profile
  const reviewObj = {
    id: `rev_${Date.now().toString(36)}`,
    clientId: sessionUser.userId,
    clientName: sessionUser.name || 'Élève 9arrini',
    clientAvatar: sessionUser.image || undefined,
    serviceId: targetBooking.serviceId,
    serviceSlug: targetBooking.serviceSlug || input.serviceSlug,
    rating: cleanRating,
    comment: cleanComment,
    quality: input.quality || cleanRating,
    communication: input.communication || cleanRating,
    behavior: input.behavior || cleanRating,
    professionalism: input.professionalism || cleanRating,
    createdAt: now,
  };

  store.reviews = [
    reviewObj,
    ...(store.reviews || []).filter(
      r => !(r.clientId === reviewObj.clientId && r.serviceId === reviewObj.serviceId)
    ),
  ];

  if (!Array.isArray(store.notifications)) store.notifications = [];
  store.notifications.unshift({
    id: `notif_release_${targetBooking.id}`,
    userId: targetBooking.freelancerId,
    title: isFreeTrial
      ? `⭐ Séance validée par ${sessionUser.name} (${cleanRating}/5 ★) pour "${targetBooking.serviceTitle}" !`
      : `💰 Paiement débloqué (+${tutorEarning} DT net) ! ${sessionUser.name} a confirmé et noté la séance "${targetBooking.serviceTitle}" (${cleanRating}/5 ★).`,
    type: 'ORDER',
    link: '/dashboard/freelancer/orders',
    read: false,
    createdAt: now,
  });

  writeCloudStore(store);
  await saveClientBookingCookie(targetBooking);
  await saveReviewCookie(reviewObj);

  revalidatePath(`/service/${targetBooking.serviceSlug || input.serviceSlug || input.serviceId}`);
  revalidatePath('/dashboard/client/bookings');
  revalidatePath('/dashboard/freelancer');
  revalidatePath('/dashboard/freelancer/orders');
  revalidatePath('/admin');

  return {
    success: true,
    message: isFreeTrial
      ? `Merci pour votre évaluation (${cleanRating}/5 ★) ! La séance a été marquée comme terminée.`
      : `Merci pour votre avis (${cleanRating}/5 ★) ! Le paiement du professeur (${tutorEarning} DT) a été débloqué.`,
  };
}

/**
 * Student reports a problem with a session (e.g. tutor absent / issue) before payout is released.
 */
export async function reportBookingDispute(input: {bookingId: string; reason: string}) {
  const sessionUser = await getUserInfo();
  if (!sessionUser?.userId) {
    return {success: false, error: 'Veuillez vous connecter.'};
  }

  const cleanReason = (input.reason || '').trim();
  if (cleanReason.length < 10) {
    return {
      success: false,
      error: 'Veuillez décrire le problème rencontré (minimum 10 caractères).',
    };
  }

  const now = new Date().toISOString();
  const store = readCloudStore();
  const cookieBookings = await getClientBookingsCookie(sessionUser.userId);

  let targetBooking = store.bookings.find(b => b.id === input.bookingId);
  const cookieMatch = cookieBookings.find(b => b.id === input.bookingId);
  if (!targetBooking && cookieMatch) {
    targetBooking = {...cookieMatch};
    store.bookings.unshift(targetBooking);
  }

  if (!targetBooking) {
    return {success: false, error: 'Réservation introuvable.'};
  }

  targetBooking.status = 'DISPUTED';
  targetBooking.payoutStatus = 'DISPUTED';
  targetBooking.disputeReason = cleanReason;

  if (!Array.isArray(store.notifications)) store.notifications = [];
  store.notifications.unshift({
    id: `notif_dispute_${targetBooking.id}`,
    userId: targetBooking.freelancerId,
    title: `⚠️ Signalement élève sur la séance "${targetBooking.serviceTitle}" : "${cleanReason}". Paiement suspendu en attente de vérification admin.`,
    type: 'SYSTEM',
    link: '/dashboard/freelancer/orders',
    read: false,
    createdAt: now,
  });

  writeCloudStore(store);
  await saveClientBookingCookie(targetBooking);

  revalidatePath('/dashboard/client/bookings');
  revalidatePath('/dashboard/freelancer/orders');
  revalidatePath('/admin');

  return {
    success: true,
    message:
      "Votre signalement a été transmis à l'administration 9arrini. Le paiement du professeur est bloqué jusqu'à vérification.",
  };
}
