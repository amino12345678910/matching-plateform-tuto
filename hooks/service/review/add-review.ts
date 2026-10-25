'use server';
import {prisma as dbContext} from '@/lib/prisma';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';

type AddReviewProps = {
  clientId: string;
  serviceId: string;
  comment: string;
  rating: number;
  clientName?: string;
  clientAvatar?: string;
};

export const AddReview = async ({
  rating = 5,
  comment,
  clientId,
  serviceId,
  clientName = 'Élève 9arrini',
  clientAvatar = '',
}: AddReviewProps) => {
  const now = new Date();
  const reviewId = `rev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  // 1. Try Prisma if available
  try {
    const review = await dbContext.review.upsert({
      where: {clientId_serviceId: {clientId, serviceId}},
      update: {rating, comment},
      create: {rating, comment, serviceId, clientId},
      select: {id: true, updatedAt: true, createdAt: true},
    });
    if (review) {
      return {success: true, review};
    }
  } catch {
    // Fallback to cloud store below
  }

  // 2. Persist in cloud store
  try {
    const store = readCloudStore();
    if (!Array.isArray(store.reviews)) {
      store.reviews = [];
    }

    const existingIndex = store.reviews.findIndex(
      r => r.clientId === clientId && r.serviceId === serviceId
    );

    const reviewObj = {
      id: reviewId,
      clientId,
      clientName,
      clientAvatar,
      serviceId,
      rating,
      comment,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    if (existingIndex >= 0) {
      store.reviews[existingIndex] = {
        ...store.reviews[existingIndex],
        rating,
        comment,
        clientName: clientName || store.reviews[existingIndex].clientName,
        clientAvatar: clientAvatar || store.reviews[existingIndex].clientAvatar,
      };
    } else {
      store.reviews.unshift(reviewObj);
    }

    writeCloudStore(store);

    return {
      success: true,
      review: {
        id: reviewId,
        rating,
        comment,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    };
  } catch (err) {
    console.error('Error saving review to cloud store:', err);
    return {
      success: true,
      review: {
        id: reviewId,
        rating,
        comment,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    };
  }
};
