'use server';

import {prisma} from '@/lib/prisma';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {revalidatePath} from 'next/cache';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
import {getCloudSessionCookie} from '@/hooks/auth/cloud-auth';
import {
  getClientTransactionsCookie,
  getClientBookingsCookie,
} from '@/hooks/book/bookings-store';
import {FREE_TRIAL_DEFAULT_ACTIVE} from '@/lib/constants';

export async function getUserPointsBalance() {
  const {userId, name, email, role} = await getUserInfo();
  if (!userId) {
    return {
      success: false,
      points: 0,
      transactions: [],
      userId: null,
      isFreeTrial: FREE_TRIAL_DEFAULT_ACTIVE,
      freeTrialEndsAt: null,
    };
  }

  // 1. Try local/remote Prisma if available
  try {
    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        pointTransactions: {
          orderBy: {createdAt: 'desc'},
          take: 25,
        },
      },
    });

    if (user) {
      const store = readCloudStore();
      return {
        success: true,
        points: user.points ?? 0,
        transactions: user.pointTransactions,
        userId: user.id,
        isFreeTrial: store.freeTrialActive ?? FREE_TRIAL_DEFAULT_ACTIVE,
        freeTrialEndsAt: store.freeTrialEndsAt ?? null,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points ?? 0,
        },
      };
    }
  } catch {
    // Cloud fallback
  }

  // 2. Read from Cloud Store + Session Cookie (all accounts start at 0 DT)
  const cloudSession = await getCloudSessionCookie();
  const store = readCloudStore();
  let cloudUser = store.users.find(
    u => u.id === userId || (email && u.email.toLowerCase() === email.toLowerCase())
  );

  if (!cloudUser) {
    cloudUser = {
      id: userId,
      name: name || cloudSession?.name || 'Élève 9arrini',
      email: email || cloudSession?.email || '',
      role: (role as 'USER' | 'SELLER' | 'ADMIN') || cloudSession?.role || 'USER',
      points: cloudSession?.points ?? 0,
      image: cloudSession?.image ?? null,
      imageSource: cloudSession?.imageSource || 'NULL',
      hasPassword: true,
      emailVerified: true,
      createdAt: cloudSession?.createdAt || new Date().toISOString(),
    };
    store.users.unshift(cloudUser);
    writeCloudStore(store);
  } else if (typeof cloudSession?.points === 'number') {
    cloudUser.points = cloudSession.points;
  }

  const points = cloudSession?.points ?? cloudUser.points ?? 0;
  const storeTx = store.transactions.filter(t => t.userId === userId);
  const cookieTx = await getClientTransactionsCookie(userId);
  const cookieBookings = await getClientBookingsCookie(userId);

  const bookingTx = cookieBookings
    .filter(b => b.totalPrice > 0)
    .map(b => ({
      id: `tx_book_${b.id}`,
      userId,
      amount: b.clientId === userId ? -b.totalPrice : b.tutorEarning ?? b.totalPrice,
      type: (b.clientId === userId ? 'BOOKING_PAYMENT' : 'EARNING') as
        | 'BOOKING_PAYMENT'
        | 'EARNING',
      description:
        b.clientId === userId
          ? `Réservation du cours "${b.serviceTitle}" (${b.servicePackageTier})`
          : `Gain cours "${b.serviceTitle}" (85% reversés après confirmation)`,
      createdAt: b.createdAt,
    }));

  const mergedRaw = [...cookieTx, ...bookingTx, ...storeTx];
  const uniqueTx = Array.from(new Map(mergedRaw.map(t => [t.id, t])).values()).map(t => ({
    ...t,
    createdAt: new Date(t.createdAt),
  }));

  return {
    success: true,
    points,
    transactions: uniqueTx,
    userId,
    isFreeTrial: store.freeTrialActive ?? FREE_TRIAL_DEFAULT_ACTIVE,
    freeTrialEndsAt: store.freeTrialEndsAt ?? null,
    user: {
      id: userId,
      name: cloudUser?.name || name || 'Élève 9arrini',
      email: cloudUser?.email || email || '',
      role: cloudUser?.role || role || 'USER',
      points,
    },
  };
}

export async function getStudentPointsData() {
  return getUserPointsBalance();
}

export async function buyStudentPoints(_amount: number, _packLabel?: string): Promise<{
  success: boolean;
  points?: number;
  newBalance?: number;
  message?: string;
  error?: string;
}> {
  const {userId} = await getUserInfo();
  if (!userId) {
    return {success: false, error: 'Veuillez vous connecter.'};
  }

  revalidatePath('/dashboard/client/points');

  return {
    success: false,
    points: 0,
    newBalance: 0,
    message:
      "🎉 Semaine de lancement 100% gratuite ! Aucun paiement requis pour réserver vos séances maintenant.",
    error:
      "🎉 Semaine de lancement 100% gratuite ! Vous n'avez besoin d'aucun paiement pour réserver vos séances maintenant. Le paiement en ligne (Flouci / D17) sera activé après la semaine d'essai gratuite.",
  };
}

export async function checkUserHasBookedService(
  serviceId: string,
  serviceSlug?: string
): Promise<boolean> {
  const {userId} = await getUserInfo();
  if (!userId) return false;

  const matchesService = (b: {serviceId?: string; serviceSlug?: string; status?: string}) =>
    b.status !== 'CANCELLED' &&
    (b.serviceId === serviceId ||
      Boolean(serviceSlug && (b.serviceSlug === serviceSlug || b.serviceId === serviceSlug)));

  // 1. Check persistent client bookings cookie
  try {
    const cookieBookings = await getClientBookingsCookie(userId);
    if (cookieBookings.some(matchesService)) return true;
  } catch {
    // ignore
  }

  // 2. Check Prisma
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        serviceId,
        clientId: userId,
      },
      select: {id: true, status: true},
    });
    if (booking && booking.status !== 'CANCELLED') return true;
  } catch {
    // ignore
  }

  // 3. Check Cloud store
  try {
    const store = readCloudStore();
    return (store.bookings || []).some(b => b.clientId === userId && matchesService(b));
  } catch {
    return false;
  }
}
