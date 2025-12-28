'use server';
import {prisma as dbContext} from '@/lib/prisma';

export const AddReview = async ({
  rating = 0,
  comment,
  clientId,
  serviceId,
}: {
  clientId: string;
  serviceId: string;
  comment?: string;
  rating: number;
}) => {
  try {
    await dbContext.review.create({
      data: {
        rating: rating || 0,
        comment,
        serviceId,
        userId: clientId,
      },
    });
    return {success: true};
  } catch (error) {
    console.error(error);
    return {success: false};
  }
};
