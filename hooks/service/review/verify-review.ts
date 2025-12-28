'use server';
import {prisma as dbContext} from '@/lib/prisma';

export const VerifyReview = async ({
  clientId,
  serviceId,
}: {
  clientId: string;
  serviceId: string;
}) => {
  try {
    const review = await dbContext.review.findMany({
      where: {clientId, serviceId},
      select: {id: true},
    });
    console.log('vr', review);
    if (review.length) return {hasReview: true};
    else return {hasReview: false};
  } catch (error) {
    console.error(error);
    return {hasReview: true};
  }
};
