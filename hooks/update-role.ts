'use server';

import {prisma} from '@/lib/prisma';

export const updateUserRole = async (email: string, role: 'USER' | 'SELLER') => {
  try {
    await prisma.user.updateMany({
      where: {email: email},
      data: {role: role === 'SELLER' ? 'SELLER' : 'USER'},
    });
    return {success: true};
  } catch (error) {
    const errorMessage = error instanceof Error ? error : new Error(String(error));
    console.error('Error updating user role:', error);
    return {success: false, error: errorMessage.message};
  }
};
