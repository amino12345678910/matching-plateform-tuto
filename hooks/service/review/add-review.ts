'use server';
import {prisma as dbContext} from '@/lib/prisma';

type AddReviewProps = {
  clientId: string;
  serviceId: string;
  comment: string;
  rating: number;
};
export const AddReview = async ({rating = 0, comment, clientId, serviceId}: AddReviewProps) => {
  try {
    const review = await dbContext.review.upsert({
      where: {clientId_serviceId: {clientId, serviceId}},
      update: {rating, comment},
      create: {rating, comment, serviceId, clientId},
      select: {id: true, updatedAt: true, createdAt: true},
    });
    return {success: true, review: review ?? {}};
  } catch (error) {
    console.error(error);
    return {success: false};
  }
};
