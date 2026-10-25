'use server';

import {prisma} from '@/lib/prisma';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {getCloudSessionCookie, setCloudSessionCookie} from '@/hooks/auth/cloud-auth';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
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
    // Cloud fallback on Netlify
  }

  const store = readCloudStore();
  const cloudSession = await getCloudSessionCookie();
  const cloudUser = store.users.find(u => u.id === userId);
  const points = cloudUser?.points ?? cloudSession?.points ?? 50;
  const userTx = store.transactions
    .filter(t => t.userId === userId)
    .map(t => ({
      ...t,
      createdAt: new Date(t.createdAt),
    }));

  return {
    success: true,
    points,
    transactions: userTx,
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

  // Always update Cloud Store & Cookie so Netlify persists the new balance
  const store = readCloudStore();
  let cloudUser = store.users.find(u => u.id === userId);
  const currentCookie = await getCloudSessionCookie();

  if (!cloudUser && currentCookie) {
    cloudUser = {
      id: currentCookie.userId,
      name: currentCookie.name,
      email: currentCookie.email,
      role: currentCookie.role,
      points: currentCookie.points ?? 50,
      image: currentCookie.image ?? null,
      imageSource: currentCookie.imageSource || 'NULL',
      hasPassword: true,
      emailVerified: true,
      createdAt: currentCookie.createdAt || new Date().toISOString(),
    };
    store.users.unshift(cloudUser);
  }

  if (cloudUser) {
    cloudUser.points =
      updatedPoints !== null ? updatedPoints : (cloudUser.points || 0) + cleanAmount;
    updatedPoints = cloudUser.points;
    store.transactions.unshift({
      id: `tx_${Date.now()}`,
      userId,
      amount: cleanAmount,
      type: 'PURCHASE',
      description,
      createdAt: new Date().toISOString(),
    });
    writeCloudStore(store);
  }

  if (currentCookie && updatedPoints !== null) {
    await setCloudSessionCookie({
      ...currentCookie,
      points: updatedPoints,
    });
  }

  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/client/points');
  revalidatePath('/explore');

  return {
    success: true,
    points: updatedPoints ?? cleanAmount,
    newBalance: updatedPoints ?? cleanAmount,
    message: `Mabrouk ! +${cleanAmount} Points (${cleanAmount} DT) ajoutés à votre compte.`,
  };
}
