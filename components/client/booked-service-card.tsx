'use client';

import Link from 'next/link';
import Image from 'next/image';
import {cloudinaryUrl} from '@/lib/cloudinary';
import type {BookedServiceType} from '@/types/bookings';
import {useEffect, useState} from 'react';
import {profilePhoto} from '../profile-url';
import {cn} from '@/lib/utils';
import {getServiceMeetInfo} from '@/lib/google-meet';
import {
  Video,
  Calendar,
  Copy,
  ExternalLink,
  MessageCircle,
  MessageSquare,
  Star,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {toast} from 'sonner';
import {confirmAndRateSession, reportBookingDispute} from '@/hooks/book/book-service';

export function BookedServiceCardComponent({service}: {service: BookedServiceType}) {
  const minPrice = Math.min(...service.packages.map(p => p.price)) || 0;
  const [avatar, setAvatar] = useState<string>('');

  const freelancerImageUrl = service.counterparty.image;
  const freelancerMail = service.counterparty.email;
  const imageSource = service.counterparty.imageSource;
  const hasSeen = Boolean(service.hasSeen);
  const rawService = service as any;

  const [confirmed, setConfirmed] = useState<boolean>(Boolean(rawService.studentConfirmed));
  const [savedRating, setSavedRating] = useState<number>(rawService.studentRating || 5);
  const [disputed, setDisputed] = useState<boolean>(rawService.bookingStatus === 'DISPUTED');

  const [showRateBox, setShowRateBox] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingRate, setSubmittingRate] = useState(false);

  const [showDisputeBox, setShowDisputeBox] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const meetInfo = getServiceMeetInfo({
    slug: service.slug,
    title: service.title,
    scheduledDate: rawService.scheduledDate,
    scheduledTime: rawService.scheduledTime,
    meetLink: rawService.meetLink,
    seller: {user: {name: service.counterparty.name}},
  });

  const cleanPhone = (rawService.tutorPhone || '').replace(/[^0-9]/g, '');
  const whatsappMessage = encodeURIComponent(
    `Bonjour Professeur ${service.counterparty.name}, j'ai réservé votre cours "${service.title}" sur 9arrini.me prévu le ${meetInfo.formattedDateLabel} (Lien de la séance vidéo : ${meetInfo.externalShareUrl}).`
  );
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${whatsappMessage}`
    : `https://wa.me/?text=${whatsappMessage}`;
  const internalChatUrl = `/dashboard/messages?tutorId=${encodeURIComponent(
    service.counterparty.id
  )}&tutorName=${encodeURIComponent(service.counterparty.name)}&course=${encodeURIComponent(
    service.title
  )}`;

  useEffect(() => {
    const init = async () => {
      const img = await profilePhoto({
        imageSource: imageSource || 'CLOUDINARY',
        imageUrl: freelancerImageUrl,
        email: freelancerMail,
      });
      setAvatar(img);
    };
    init();
  }, [imageSource, freelancerImageUrl, freelancerMail]);

  const handleConfirmSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      toast.error('Veuillez écrire un court avis sur la séance (minimum 5 caractères).');
      return;
    }
    setSubmittingRate(true);
    try {
      const res = await confirmAndRateSession({
        bookingId: rawService.bookingId || service.id,
        serviceId: rawService.serviceId || service.id,
        serviceSlug: service.slug,
        rating,
        comment,
      });
      if (res.success) {
        setConfirmed(true);
        setSavedRating(rating);
        setShowRateBox(false);
        toast.success(res.message || 'Séance confirmée et professeur noté !');
      } else {
        toast.error(res.error || "Erreur lors de l'envoi de l'évaluation.");
      }
    } catch {
      toast.error("Erreur lors de l'envoi de l'évaluation.");
    } finally {
      setSubmittingRate(false);
    }
  };

  const handleReportDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disputeReason.trim().length < 10) {
      toast.error('Veuillez décrire le problème rencontré (minimum 10 caractères).');
      return;
    }
    setSubmittingDispute(true);
    try {
      const res = await reportBookingDispute({
        bookingId: rawService.bookingId || service.id,
        reason: disputeReason,
      });
      if (res.success) {
        setDisputed(true);
        setShowDisputeBox(false);
        toast.success(res.message || 'Signalement envoyé à l’administration.');
      } else {
        toast.error(res.error || 'Erreur lors du signalement.');
      }
    } catch {
      toast.error('Erreur lors du signalement.');
    } finally {
      setSubmittingDispute(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] w-full border border-border rounded-xl overflow-hidden bg-background shadow-sm transition hover:shadow-md">
      <Link href={`/service/${service.slug}`}>
        <div className="relative h-40 sm:h-full min-h-[160px] w-full overflow-hidden">
          <Image
            src={
              service.images[0]
                ? cloudinaryUrl(service.images[0], 'q_30,f_auto')
                : '/assets/tutoring-academy.jpg'
            }
            loading="eager"
            alt={service.title}
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
      </Link>

      <div className="flex flex-col justify-between p-4 gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-2 font-semibold',
                disputed
                  ? 'text-red-600'
                  : confirmed
                  ? 'text-emerald-700'
                  : hasSeen
                  ? 'text-foreground'
                  : 'text-emerald-700'
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  disputed
                    ? 'bg-red-500'
                    : confirmed
                    ? 'bg-emerald-600'
                    : 'bg-amber-500 animate-pulse'
                )}
              />
              {disputed
                ? 'Litige signalé (Paiement bloqué)'
                : confirmed
                ? `Séance terminée & évaluée (${savedRating}/5 ★)`
                : 'Séance programmée — En attente de votre avis après cours'}
            </span>
          </div>

          <Link href={`/service/${service.slug}`}>
            <p className="text-sm font-semibold leading-snug line-clamp-2 hover:underline">
              {service.title}
            </p>
          </Link>

          <Link
            href={`/freelancer/${service.counterparty.id}`}
            className="flex items-center gap-2 mt-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <img
              src={avatar || '/avatar.png'}
              alt={service.counterparty.name}
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="font-medium truncate">Prof. {service.counterparty.name}</span>
          </Link>

          {/* Google Meet & Schedule Box */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 space-y-1.5 text-xs mt-2">
            <div className="flex items-center justify-between text-emerald-900 font-semibold">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                {meetInfo.formattedDateLabel}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(meetInfo.externalShareUrl);
                  toast.success('Lien de la séance vidéo copié !');
                }}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline cursor-pointer"
              >
                <Copy className="h-3 w-3" />
                {meetInfo.meetCode}
              </button>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <a
                href={meetInfo.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-2 text-[11px] font-semibold"
              >
                <Video className="h-3 w-3" />
                {meetInfo.isCustomGoogleMeet ? 'Rejoindre Google Meet' : 'Rejoindre la Salle Vidéo'}
              </a>
              <a
                href={meetInfo.googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 rounded border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-800 py-1.5 px-2 text-[11px] font-semibold"
              >
                <ExternalLink className="h-3 w-3" />
                Agenda
              </a>
            </div>
          </div>

          {/* Direct Tutor Contact Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white py-1.5 px-2.5 text-[11px] font-bold transition shadow-xs"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp Prof
            </a>
            <Link
              href={internalChatUrl}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 py-1.5 px-2.5 text-[11px] font-semibold transition"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              Chat 9arrini
            </Link>
          </div>

          {/* Post-Session Rating & Payout Validation Section */}
          <div className="pt-2">
            {confirmed ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Séance confirmée et notée ({savedRating}/5 ★) — Paiement du professeur validé !
                </span>
              </div>
            ) : disputed ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 flex items-center gap-2 text-xs text-red-900 font-semibold">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>
                  Problème signalé à l&apos;administration 9arrini — Paiement bloqué en attente de
                  vérification.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRateBox(!showRateBox);
                      setShowDisputeBox(false);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-zinc-950 py-2 px-3 text-xs font-extrabold cursor-pointer transition"
                  >
                    <Star className="h-3.5 w-3.5 fill-zinc-950" />
                    Confirmer &amp; Noter le Prof (Débloquer paiement)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisputeBox(!showDisputeBox);
                      setShowRateBox(false);
                    }}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 py-2 px-2.5 text-[11px] font-semibold cursor-pointer"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Problème
                  </button>
                </div>

                {showRateBox && (
                  <form
                    onSubmit={handleConfirmSession}
                    className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 space-y-2.5 text-xs"
                  >
                    <div className="font-bold text-amber-950">
                      Noter la séance avec Prof. {service.counterparty.name} :
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 cursor-pointer"
                        >
                          <Star
                            className={cn(
                              'h-5 w-5',
                              star <= rating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-zinc-300'
                            )}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-bold text-amber-900">{rating}/5 étoiles</span>
                    </div>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Comment s'est passée la séance ? (ex: Très bonnes explications, ponctuel...)"
                      className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingRate}
                      className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 text-xs cursor-pointer"
                    >
                      {submittingRate
                        ? 'Validation en cours...'
                        : 'Valider la séance & Envoyer ma note'}
                    </button>
                  </form>
                )}

                {showDisputeBox && (
                  <form
                    onSubmit={handleReportDispute}
                    className="rounded-xl border border-red-300 bg-red-50/70 p-3 space-y-2 text-xs"
                  >
                    <div className="font-bold text-red-900">
                      Signaler une absence ou un problème (bloque le paiement du prof) :
                    </div>
                    <textarea
                      rows={2}
                      value={disputeReason}
                      onChange={e => setDisputeReason(e.target.value)}
                      placeholder="Expliquez le problème (ex: Le professeur ne s'est pas connecté sur Google Meet...)"
                      className="w-full rounded-lg border border-red-300 bg-white p-2 text-xs"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingDispute}
                      className="w-full rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 text-xs cursor-pointer"
                    >
                      {submittingDispute ? 'Envoi...' : "Envoyer le signalement à l'admin"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
          <Link
            href={`/service/${service.slug}`}
            className="font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            Voir les détails du cours
          </Link>

          <span className="font-semibold text-emerald-700">
            {minPrice === 0 ? 'Essai Gratuit (0 DT)' : `Tarif : ${minPrice} DT`}
          </span>
        </div>
      </div>
    </div>
  );
}
