'use server';

import {prisma} from '@/lib/prisma';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {getCloudSessionCookie, setCloudSessionCookie} from '@/hooks/auth/cloud-auth';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
import {
  getClientBookingsCookie,
  getClientTransactionsCookie,
  saveClientTransactionCookie,
  saveClientNotificationCookie,
} from '@/hooks/book/bookings-store';
import {revalidatePath} from 'next/cache';

export async function getStudentPointsData() {
  const {userId, name, email, role} = await getUserInfo();
  if (!userId) {
    return {success: false, points: 0, transactions: [], userId: null, user: null};
  }

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
      return {
        success: true,
        points: user.points ?? 0,
        transactions: user.pointTransactions ?? [],
        userId,
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

  const store = readCloudStore();
  const cloudSession = await getCloudSessionCookie();
  const cloudUser = store.users.find(u => u.id === userId);
  const points = cloudSession?.points ?? cloudUser?.points ?? 50;

  const cookieTx = await getClientTransactionsCookie(userId);
  const cookieBookings = await getClientBookingsCookie(userId);
  const bookingTx = cookieBookings.map(b => ({
    id: `tx_bk_${b.id}`,
    userId,
    amount: -b.totalPrice,
    type: 'BOOKING_PAYMENT' as const,
    description: `Réservation cours : "${b.serviceTitle}" (Pack ${b.servicePackageTier} — ${b.totalPrice} DT)`,
    createdAt: b.createdAt,
  }));

  const storeTx = store.transactions.filter(t => t.userId === userId);
  const welcomeTx = {
    id: `tx_welcome_${userId}`,
    userId,
    amount: 50,
    type: 'BONUS' as const,
    description: 'Solde de bienvenue 9arrini (50 Points = 50 DT offerts)',
    createdAt: cloudSession?.createdAt || new Date().toISOString(),
  };

  const mergedRaw = [...cookieTx, ...bookingTx, ...storeTx, welcomeTx];
  const uniqueTx = Array.from(new Map(mergedRaw.map(t => [t.id, t])).values()).map(t => ({
    ...t,
    createdAt: new Date(t.createdAt),
  }));

  return {
    success: true,
    points,
    transactions: uniqueTx,
    userId,
    user: {
      id: userId,
      name: cloudUser?.name || name || 'Élève 9arrini',
      email: cloudUser?.email || email || '',
      role: cloudUser?.role || role || 'USER',
      points,
    },
  };
}

export async function buyStudentPoints(amount: number, packLabel?: string) {
  const {userId} = await getUserInfo();
  if (!userId) {
    return {success: false, error: 'Veuillez vous connecter pour recharger vos points.'};
  }

  const cleanAmount = Math.floor(Number(amount));
  if (!cleanAmount || cleanAmount <= 0 || cleanAmount > 10000) {
    return {success: false, error: 'Montant invalide (entre 1 et 10 000 Points).'};
  }

  const description =
    packLabel || `Recharge Compte 9arrini (+${cleanAmount} Points = ${cleanAmount} DT)`;

  let updatedPoints: number | null = null;

  try {
    const updatedUser = await prisma.user.update({
      where: {id: userId},
      data: {
        points: {increment: cleanAmount},
        pointTransactions: {
          create: {
            amount: cleanAmount,
            type: 'TOPUP',
            description,
          },
        },
        notifications: {
          create: {
            type: 'AUTOMATED',
            title: `+${cleanAmount} Points (${cleanAmount} DT) ajoutés à votre solde 9arrini !`,
            link: '/dashboard/client/points',
          },
        },
      },
      select: {points: true},
    });
    updatedPoints = updatedUser.points;
  } catch {
    // Cloud fallback
  }

  const store = readCloudStore();
  let cloudUser = store.users.find(u => u.id === userId);
  const currentCookie = await getCloudSessionCookie();
  const basePoints = currentCookie?.points ?? cloudUser?.points ?? 50;

  if (updatedPoints === null) {
    updatedPoints = basePoints + cleanAmount;
  }

  if (!cloudUser && currentCookie) {
    cloudUser = {
      id: currentCookie.userId,
      name: currentCookie.name,
      email: currentCookie.email,
      role: currentCookie.role,
      points: updatedPoints,
      image: currentCookie.image ?? null,
      imageSource: currentCookie.imageSource || 'NULL',
      hasPassword: true,
      emailVerified: true,
      createdAt: currentCookie.createdAt || new Date().toISOString(),
    };
    store.users.unshift(cloudUser);
  } else if (cloudUser) {
    cloudUser.points = updatedPoints;
  }

  const now = new Date().toISOString();
  const txRecord = {
    id: `tx_${Date.now()}`,
    userId,
    amount: cleanAmount,
    type: 'PURCHASE' as const,
    description,
    createdAt: now,
  };

  await saveClientTransactionCookie(txRecord);
  await saveClientNotificationCookie({
    id: `notif_topup_${Date.now()}`,
    userId,
    title: `💳 Recharge confirmée : +${cleanAmount} Points (${cleanAmount} DT) ajoutés. Nouveau solde : ${updatedPoints} Pts.`,
    type: 'AUTOMATED',
    link: '/dashboard/client/points',
    read: false,
    createdAt: now,
  });

  store.transactions.unshift(txRecord);
  writeCloudStore(store);

  if (currentCookie) {
    await setCloudSessionCookie({
      ...currentCookie,
      points: updatedPoints,
    });
  }

  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/client/points');
  revalidatePath('/notification');
  revalidatePath('/explore');

  return {
    success: true,
    points: updatedPoints,
    newBalance: updatedPoints,
    message: `Mabrouk ! +${cleanAmount} Points (${cleanAmount} DT) ajoutés à votre compte.`,
  };
}

export async function checkUserHasBookedService(serviceId: string): Promise<boolean> {
  const {userId} = await getUserInfo();
  if (!userId) return false;

  // 1. Check persistent client bookings cookie
  try {
    const cookieBookings = await getClientBookingsCookie(userId);
    if (cookieBookings.some(b => b.serviceId === serviceId)) return true;
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
      select: {id: true},
    });
    if (booking) return true;
  } catch {
    // ignore
  }

  // 3. Check Cloud store
  try {
    const store = readCloudStore();
    return (store.bookings || []).some(
      b => b.serviceId === serviceId && b.clientId === userId
    );
  } catch {
    return false;
  }
}
