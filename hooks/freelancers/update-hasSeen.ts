'use server';

import {prisma as dbContext} from '@/lib/prisma';

type updatehasSeenProps = {
  bookingId: string;
};
export const updatehasSeen = async ({
  bookingId,
}: updatehasSeenProps): Promise<{
  error?: string;
  message?: string;
  success: boolean;
}> => {
  try {
    const prisma = await dbContext.booking.update({
      where: {id: bookingId, hasSeen: null},
      data: {hasSeen: new Date()},
      select: {hasSeen: true},
    });

    if (!prisma.hasSeen) {
      return {
        error: "Couldn't update hasSeen",
        success: false,
        message: undefined,
      };
    }

    return {
      error: undefined,
      success: true,
      message: `You have seen the booking at: ${prisma.hasSeen}`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : error;
    return {error: errorMessage as string, success: false, message: undefined};
  }
};
