'use server';

import {prisma} from '@/lib/prisma';

export const updateUserRole = async (email: string, role: 'USER' | 'SELLER') => {
  try {
    const normalizedRole = role === 'SELLER' ? 'SELLER' : 'USER';
    await prisma.user.updateMany({
      where: {email: email},
      data: {role: normalizedRole},
    });
    if (normalizedRole === 'SELLER') {
      const user = await prisma.user.findUnique({where: {email}});
      if (user) {
        await prisma.seller.upsert({
          where: {userId: user.id},
          update: {},
          create: {userId: user.id},
        });
      }
    }
    return {success: true};
  } catch (error) {
    const errorMessage = error instanceof Error ? error : new Error(String(error));
    console.error('Error updating user role:', error);
    return {success: false, error: errorMessage.message};
  }
};
