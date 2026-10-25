'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Star, MessageSquareQuote} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import type {Review} from '@/types/review';

interface ReviewDisplayProps {
  dbReviews: Review[];
  currentReview?: Review;
}

export function ReviewDisplay({dbReviews = [], currentReview}: ReviewDisplayProps) {
  const reviews: Review[] = currentReview
    ? [currentReview, ...dbReviews.filter(r => r.id !== currentReview.id)]
    : dbReviews;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + (review.rating || 5), 0) / reviews.length
      : 5.0;

  const ReviewStars = ({rating, size = 16}: {rating: number; size?: number}) => {
    return (
      <div className="flex gap-0.5 items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={size}
            className={cn(
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-200 dark:fill-slate-800 dark:text-slate-800'
            )}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateInput: any) => {
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return 'Récemment';
      return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Récemment';
    }
  };

  return (
    <Card className="w-full mx-0 px-0 py-2 shadow-none border-none">
      <CardHeader className="px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5 text-emerald-600" />
              Avis et Notes des Élèves ({reviews.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Évaluations réelles vérifiées sur la plateforme 9arrini
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl">
            <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <ReviewStars rating={averageRating} size={18} />
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {reviews.length} avis d&apos;élève{reviews.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-0">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            Aucun avis pour l&apos;instant. Soyez le premier élève à noter cette séance !
          </div>
        ) : (
          reviews.map(review => {
            const client = review.client;
            const clientName = client?.name || 'Élève 9arrini';
            const clientInitials = clientName.slice(0, 2).toUpperCase();
            const avatarUrl =
              client?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=059669&color=fff&bold=true`;

            return (
              <div
                key={review.id}
                className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-2.5 bg-card"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-emerald-500/20">
                      <AvatarImage src={avatarUrl} alt={clientName} className="object-cover" />
                      <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-xs">
                        {clientInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {clientName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>

                  <ReviewStars rating={review.rating || 5} />
                </div>

                {review.comment && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                    {review.comment}
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
