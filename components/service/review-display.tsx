'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Star} from 'lucide-react';
import {cn} from '@/lib/utils';
import {profilePhoto} from '../profile-url';
import type {User} from '@/generated/prisma';
import Image from 'next/image';

interface ReviewDisplayProps {
  reviews:
    | {
        id: string;
        rating: number;
        comment: string;
        client: {
          id: string;
          name: string;
          avatar?: string;
          imageSource: User['imageSource'];
        };
        service?: {
          id: string;
          title?: string;
        };
        createdAt: Date;
      }[]
    | [];
}

export function ReviewDisplay({reviews = []}: ReviewDisplayProps) {
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  const ReviewStars = ({rating}: {rating: number}) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={16}
            className={cn(
              star <= rating
                ? 'fill-[var(--star-filled)] text-[var(--star-filled)]'
                : 'fill-[var(--star-empty)] text-[var(--star-empty)]'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full mx-0 px-0">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-semibold">Reviews ({reviews.length})</CardTitle>
            <CardDescription>Based on client feedback</CardDescription>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-[var(--primary)]">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center my-2">
              <ReviewStars rating={Math.round(averageRating)} />
            </div>
            <div className="text-sm text-[var(--muted-foreground)]">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-[var(--muted-foreground)]">
            No reviews yet. Be the first to leave a review!
          </div>
        ) : (
          reviews.map(async review => (
            <div
              key={review.id}
              className="border-b border-[var(--border)] pb-6 last:border-0 last:pb-0 first:pt-0 pt-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Image
                    loading="eager"
                    alt={review.client.name}
                    src={await profilePhoto({
                      imageUrl: review.client.avatar,
                      imageSource: review.client.imageSource,
                    })}
                    height={50}
                    width={50}
                    className="rounded-full object-cover h-12 w-12"
                  />
                  <div>
                    <div className="font-semibold">{review.client.name}</div>
                    <div className="text-sm text-[var(--muted-foreground)]">
                      {review.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <ReviewStars rating={review.rating} />
              </div>

              {review.comment && (
                <div className="mt-4 text-sm leading-relaxed text-[var(--foreground)]">
                  {review.comment}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
