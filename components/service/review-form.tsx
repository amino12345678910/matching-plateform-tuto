import {Star} from 'lucide-react';
import {Button} from '../ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';
import {Label} from '../ui/label';
import {Textarea} from '../ui/textarea';
import {cn} from '@/lib/utils';
import {useEffect, useState} from 'react';
import {AddReview} from '@/hooks/service/review/add-review';
import {allowClientOnly} from './validate/allow-user-only';
import {VerifyReview} from '@/hooks/service/review/verify-review';
import type {Review} from '@/types/review';

export interface ReviewData {
  rating: number;
  comment?: string;
  categories?: {
    quality: number;
    communication: number;
    behavior: number;
    professionalism: number;
  };
}
interface ReviewsProps {
  serviceId: string;
  sendCurrentReview: (review: Review) => void;
}

const categories = [
  {
    id: 'quality' as const,
    label: 'Quality of Work',
    question: 'How satisfied are you with the final deliverables?',
  },
  {
    id: 'communication' as const,
    label: 'Communication',
    question: 'How well did they communicate throughout the project?',
  },
  {
    id: 'behavior' as const,
    label: 'Professional Behavior',
    question: 'Were they professional and easy to work with?',
  },
  {
    id: 'professionalism' as const,
    label: 'Professionalism',
    question: 'Did they meet deadlines and follow instructions?',
  },
];
export function ReviewForm({serviceId, sendCurrentReview}: ReviewsProps) {
  const [categoryRatings, setCategoryRatings] = useState({
    quality: 0,
    communication: 0,
    behavior: 0,
    professionalism: 0,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canClientSubmit, setCanClientSubmit] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {disable, clientId} = await allowClientOnly();
      if (disable || !clientId) return;
      const {hasReview} = await VerifyReview({clientId, serviceId});

      if (!hasReview) setCanClientSubmit(true);
    };
    init();
  }, []);

  const handleCategoryRating = (categoryId: keyof typeof categoryRatings, rating: number) => {
    setCategoryRatings(prev => ({
      ...prev,
      [categoryId]: rating,
    }));
  };

  const calculateAverageRating = () => {
    const categoryValues = Object.values(categoryRatings).filter(r => r > 0);
    if (categoryValues.length === 0) return 0;

    const sum = categoryValues.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / categoryValues.length) * 10) / 10;
  };

  const handleSubmit = async () => {
    const finalRating = calculateAverageRating();
    if (finalRating === 0) {
      alert('Please provide at least one rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const {disable, clientId} = await allowClientOnly();
      if (disable || !clientId) {
        console.error(`Only clients can give review`);
        return;
      }
      const {success, review} = await AddReview({
        clientId,
        serviceId,
        rating: finalRating,
        comment,
      });

      if (success && review) {
        setCategoryRatings({
          quality: 0,
          communication: 0,
          behavior: 0,
          professionalism: 0,
        });
        setComment('');
        setCanClientSubmit(false);
        sendCurrentReview(review);
        console.log('baly baly!!', review);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingStars = ({
    rating,
    onRatingChange,
    size = 'md',
  }: {
    rating: number;
    onRatingChange: (value: number) => void;
    size?: 'sm' | 'md' | 'lg';
  }) => {
    const starSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            disabled={!canClientSubmit}
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="cursor-pointer border-none bg-transparent p-1 transition-transform hover:scale-110 focus:outline-none"
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              size={starSize}
              className={cn(
                'transition-colors',
                star <= rating
                  ? 'fill-[var(--star-filled)] text-[var(--star-filled)]'
                  : 'fill-[var(--star-empty)] text-[var(--star-empty)]'
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  if (canClientSubmit)
    return (
      <Card className="max-w-2xl sm:max-w-full w-full mx-auto border-none shadow-none py-3">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-semibold mb-2">Leave a Review</CardTitle>
          <CardDescription>
            Share your experience working with this freelancer. Your feedback helps others make
            informed decisions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-0">
          <div className="space-y-5">
            <Label className="text-base font-medium">Rate Specific Aspects</Label>

            <div className="space-y-5">
              {categories.map(category => (
                <div key={category.id} className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">{category.label}</Label>
                    <p className="text-sm text-muted-foreground mt-1">{category.question}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <RatingStars
                      rating={categoryRatings[category.id]}
                      onRatingChange={rating => handleCategoryRating(category.id, rating)}
                      size="md"
                    />
                    <span className="text-sm font-medium text-primary min-w-12 text-center">
                      {categoryRatings[category.id] > 0
                        ? `${categoryRatings[category.id]}/5`
                        : 'Not rated'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">Your Written Review</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Tell us about your experience. What went well? What could be improved?
              </p>
            </div>

            <Textarea
              placeholder="Share details of your experience with this freelancer..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="min-h-[120px] resize-y"
              maxLength={1000}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Your review will be public</span>
              <span>{comment.length}/1000 characters</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setCategoryRatings({
                  quality: 0,
                  communication: 0,
                  behavior: 0,
                  professionalism: 0,
                });
                setComment('');
              }}
              disabled={isSubmitting}
            >
              Reset
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || calculateAverageRating() === 0}
              className={cn(
                'font-semibold',
                calculateAverageRating() === 0 && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
}
