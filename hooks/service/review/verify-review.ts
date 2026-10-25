'use server';
import {prisma as dbContext} from '@/lib/prisma';
import {readCloudStore} from '@/lib/cloud-store';
import {getReviewsCookie} from '@/hooks/book/bookings-store';

export const VerifyReview = async ({
  clientId,
  serviceId,
}: {
  clientId: string;
  serviceId: string;
}) => {
  // 1. Check persistent cookie
  try {
    const cookieReviews = await getReviewsCookie(serviceId);
    if (cookieReviews.some(r => r.clientId === clientId && r.serviceId === serviceId)) {
      return {hasReview: true};
    }
  } catch {
    // ignore
  }

  // 2. Check Prisma if reachable
  try {
    const review = await dbContext.review.findMany({
      where: {clientId, serviceId},
      select: {id: true},
    });
    if (review && review.length > 0) return {hasReview: true};
  } catch {
    // Ignore and fallback to cloud store
  }

  // 3. Check Cloud Store
  try {
    const store = readCloudStore();
    const existing = (store.reviews || []).some(
      r => r.clientId === clientId && r.serviceId === serviceId
    );
    return {hasReview: existing};
  } catch {
    return {hasReview: false};
  }
};
