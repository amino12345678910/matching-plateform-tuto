'use server';

import {prisma} from '@/lib/prisma';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {revalidatePath} from 'next/cache';

export async function getStudentPointsData() {
  const {userId} = await getUserInfo();
  if (!userId) {
    return {points: 0, transactions: [], userId: null};
  }

  const user = await prisma.user.findUnique({
    where: {id: userId},
    select: {
      points: true,
      pointTransactions: {
        orderBy: {createdAt: 'desc'},
        take: 25,
      },
    },
  });

  return {
    points: user?.points ?? 0,
    transactions: user?.pointTransactions ?? [],
    userId,
  };
}

export async function buyStudentPoints(amount: number, packLabel?: string) {
  const {userId} = await getUserInfo();
  if (!userId) {
    return {success: false, error: 'Please log in first to top up points.'};
  }

  const cleanAmount = Math.floor(Number(amount));
  if (!cleanAmount || cleanAmount <= 0 || cleanAmount > 10000) {
    return {success: false, error: 'Invalid points amount (must be between 1 and 10,000 Pts).'};
  }

  try {
    const updatedUser = await prisma.user.update({
      where: {id: userId},
      data: {
        points: {increment: cleanAmount},
        pointTransactions: {
          create: {
            amount: cleanAmount,
            type: 'TOPUP',
            description:
              packLabel || `Recharge Compte 9arrini (+${cleanAmount} Points = ${cleanAmount} DT)`,
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

    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/client/points');
    revalidatePath('/explore');

    return {
      success: true,
      points: updatedUser.points,
      message: `Mabrouk ! +${cleanAmount} Points (${cleanAmount} DT) ajoutés à votre compte.`,
    };
  } catch (error) {
    console.error('Error buying points:', error);
    return {success: false, error: 'Failed to recharge points. Please try again.'};
  }
}
