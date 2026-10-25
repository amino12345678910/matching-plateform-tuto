'use client';

import {Star, MessageSquare, Send, CheckCircle2, UserCheck, LogIn} from 'lucide-react';
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
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {profilePhoto} from '../profile-url';
import {toast} from 'sonner';

interface ReviewsProps {
  serviceId: string;
  sendCurrentReview: (review: Review) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1/5 • À améliorer',
  2: '2/5 • Passable',
  3: '3/5 • Bien',
  4: '4/5 • Très bien',
  5: '5/5 • Excellent professeur !',
};

export function ReviewForm({serviceId, sendCurrentReview}: ReviewsProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canClientSubmit, setCanClientSubmit] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const {disable, clientId, name, role} = await allowClientOnly();
        if (role) setIsLoggedIn(true);
        if (name) setUserName(name);

        if (!clientId) {
          setCanClientSubmit(false);
          return;
        }

        const {hasReview} = await VerifyReview({clientId, serviceId});
        if (hasReview) {
          setAlreadyReviewed(true);
          setCanClientSubmit(false);
        } else {
          setCanClientSubmit(true);
        }
      } catch (err) {
        console.error('Review check error:', err);
      }
    };
    init();
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Veuillez sélectionner une note entre 1 et 5 étoiles');
      return;
    }
    if (!comment.trim()) {
      toast.error('Veuillez ajouter un court commentaire pour ce professeur');
      return;
    }

    setIsSubmitting(true);
    try {
      const {disable, clientId, name} = await allowClientOnly();
      if (disable || !clientId) {
        toast.info('Veuillez vous connecter avec un compte élève pour noter ce professeur');
        return;
      }

      const {userId, name: uName, image, imageSource, email} = await getUserInfo();
      const avatarUrl = await profilePhoto({
        imageUrl: image,
        imageSource,
        email: email || uName,
      });

      const clientDisplayName = uName || name || 'Élève 9arrini';

      const res = await AddReview({
        clientId,
        serviceId,
        rating,
        comment: comment.trim(),
        clientName: clientDisplayName,
        clientAvatar: avatarUrl,
      });

      if (res.success && res.review) {
        toast.success('Merci ! Votre avis a été publié avec succès.');
        sendCurrentReview({
          id: res.review.id || `rev_${Date.now()}`,
          rating,
          comment: comment.trim(),
          clientId,
          serviceId,
          client: {
            id: userId || clientId,
            name: clientDisplayName,
            avatar: avatarUrl,
            imageSource: (imageSource as any) || 'GOOGLE',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        setComment('');
        setAlreadyReviewed(true);
        setCanClientSubmit(false);
      } else {
        toast.error('Impossible d’enregistrer votre avis. Réessayez.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Erreur lors de l’envoi de votre avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStarCount = hoverRating ?? rating;

  if (alreadyReviewed) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-emerald-900 dark:text-emerald-300">
            Avis déjà enregistré
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vous avez déjà partagé votre note et votre avis pour cette séance. Merci pour votre
            contribution !
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-dashed border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 text-center space-y-2">
        <div className="flex justify-center text-amber-500">
          <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
        </div>
        <h3 className="text-sm font-bold">Vous avez suivi ce cours ? Donnez votre avis !</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Connectez-vous avec votre compte élève pour attribuer une note de 1 à 5 étoiles et laisser
          un commentaire au professeur.
        </p>
        <div className="pt-2">
          <Button
            type="button"
            size="sm"
            onClick={() => (window.location.href = '/auth/login')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            <LogIn className="h-3.5 w-3.5 mr-1.5" />
            Se connecter pour noter le professeur
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full border-2 border-emerald-500/20 shadow-md shadow-emerald-500/5 rounded-2xl overflow-hidden my-4">
      <CardHeader className="bg-gradient-to-r from-emerald-50/60 to-teal-50/60 dark:from-emerald-950/20 dark:to-teal-950/20 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <Star className="h-4 w-4 fill-emerald-500" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Noter ce professeur et laisser un avis
            </CardTitle>
            <CardDescription className="text-xs">
              En tant qu&apos;élève ({userName}), votre note aide la communauté d&apos;élèves 9arrini.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Star Picker */}
          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Votre note globale :
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(starValue => (
                  <button
                    key={starValue}
                    type="button"
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(starValue)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`Attribuer ${starValue} étoile${starValue > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={cn(
                        'h-7 w-7 transition-colors cursor-pointer',
                        starValue <= activeStarCount
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'fill-slate-200 text-slate-200 dark:fill-slate-800 dark:text-slate-700'
                      )}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
                {RATING_LABELS[activeStarCount] || `${activeStarCount}/5`}
              </span>
            </div>
          </div>

          {/* Comment input */}
          <div className="space-y-1.5">
            <Label
              htmlFor="review-comment"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              Votre commentaire :
            </Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Expliquez ce qui vous a plu : clarté des explications, méthode de travail, ponctualité, résultats obtenus..."
              className="min-h-[90px] rounded-xl text-xs resize-none"
              maxLength={1000}
              required
            />
            <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-0.5">
              <span>Avis public vérifié par 9arrini</span>
              <span>{comment.length}/1000 caractères</span>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/10"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent mr-1.5" />
                  Publication en cours...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Publier ma note et mon avis
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
