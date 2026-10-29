'use client';

import {useState, useMemo, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {Separator} from '../ui/separator';
import {Avatar, AvatarFallback, AvatarImage} from '../ui/avatar';
import {Tabs, TabsList, TabsTrigger} from '../ui/tabs';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '../ui/accordion';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {
  ChevronRight,
  Star,
  Clock,
  RefreshCw,
  Shield,
  Zap,
  CheckCircle,
  Coins,
  ShieldCheck,
  PlusCircle,
  GraduationCap,
  BookOpen,
  Award,
  Video,
  Calendar,
  Copy,
  ExternalLink,
  Lock,
  UserCheck,
  MessageCircle,
  MessageSquare,
  BellRing,
} from 'lucide-react';
import type {Service, ServicePackage} from '@/types/service';
import {allowClientOnly} from './validate/allow-user-only';
import {toast} from 'sonner';
import {ServiceCarousel} from '../autoplay-carousel';
import {bookService} from '@/hooks/book/book-service';
import {
  getStudentPointsData,
  buyStudentPoints,
  checkUserHasBookedService,
} from '@/hooks/points/points-actions';
import {profilePhoto} from '../profile-url';
import Link from 'next/link';
import moment from 'moment';
import '@/components/editor/styles/tiptap.scss';
import '@/components/editor/styles/utils.css';
import {ReviewDisplay} from './review-display';
import {ReviewForm} from './review-form';
import type {Review} from '@/types/review';
import {
  getServiceMeetInfo,
  formatScheduleLabel,
  buildGoogleCalendarMeetUrl,
} from '@/lib/google-meet';
import {escapeHtml, sanitizeRichHtml} from '@/lib/sanitize';

const BOOKED_SERVICES_STORAGE_KEY = '9arrini_booked_services_v1';

export function ServiceDetailPage({
  service,
  initialHasBooked = false,
}: {
  service: Service;
  initialHasBooked?: boolean;
}) {
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage['name']>('BASIC');
  const [isBooking, setIsBooking] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);
  const [avatar, setAvatar] = useState<string>('');
  const [currentReview, setCurrentReview] = useState<Review>();
  const [studentPoints, setStudentPoints] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasBooked, setHasBooked] = useState<boolean>(Boolean(initialHasBooked));
  const [isFreeTrial, setIsFreeTrial] = useState<boolean>(true);

  const reviewCount = service.reviews?.length || 0;
  const avgRating = useMemo(
    () =>
      reviewCount === 0
        ? 0
        : (service.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1),
    [service.reviews, reviewCount]
  );

  const seller = service.seller;
  const sellerName = seller.user.name || 'Professeur 9arrini';
  const isSellerVerified = Boolean(
    (seller as any)?.isVerified === true || (seller as any)?.verified === true
  );
  const sellerSpecialty = (seller as any)?.specialty;
  const sellerCredentials = (seller as any)?.credentials;
  const sellerExperience = (seller as any)?.experience;

  const displayTitle = (service.title || '').trim();
  const initialMeet = useMemo(() => getServiceMeetInfo(service as any), [service]);
  const [sessionDate, setSessionDate] = useState(initialMeet.scheduledDate);
  const [sessionTime, setSessionTime] = useState(initialMeet.scheduledTime);

  const liveCalendarUrl = useMemo(
    () =>
      buildGoogleCalendarMeetUrl({
        title: displayTitle,
        meetUrl: initialMeet.meetUrl,
        dateStr: sessionDate,
        timeStr: sessionTime,
        durationMinutes: 60,
        tutorName: sellerName,
      }),
    [displayTitle, initialMeet.meetUrl, sessionDate, sessionTime, sellerName]
  );

  const copyMeetUrl = () => {
    navigator.clipboard.writeText(initialMeet.meetUrl);
    toast.success('Lien Google Meet copié !');
  };

  useEffect(() => {
    const init = async () => {
      const img = await profilePhoto({
        imageUrl: service.seller.user.image,
        imageSource: (service.seller.user as any).imageSource || 'CLOUDINARY',
        email: service.seller.user.email || '',
      });
      setAvatar(img);

      const pointsRes = await getStudentPointsData();
      let resolvedUid: string | null = null;
      if (typeof pointsRes.isFreeTrial === 'boolean') {
        setIsFreeTrial(pointsRes.isFreeTrial);
      }
      if (pointsRes.success && pointsRes.user) {
        setStudentPoints(pointsRes.user.points ?? 0);
        setUserRole(pointsRes.user.role ?? null);
        resolvedUid = pointsRes.user.id || pointsRes.userId || null;
        setCurrentUserId(resolvedUid);
      }

      // Check local storage for immediate client-side persistence
      if (resolvedUid) {
        try {
          const raw = localStorage.getItem(`${BOOKED_SERVICES_STORAGE_KEY}_${resolvedUid}`);
          if (raw) {
            const arr: string[] = JSON.parse(raw);
            if (arr.includes(service.id) || (service.slug && arr.includes(service.slug))) {
              setHasBooked(true);
            }
          }
        } catch {
          // ignore
        }
      }

      const booked = await checkUserHasBookedService(service.id, service.slug);
      if (booked) {
        setHasBooked(true);
      }
    };
    init();
  }, [service.id, service.slug, service.seller.user.image, service.seller.user.email]);

  const isTutorOwner = Boolean(
    (userRole === 'SELLER' || userRole === 'FREELANCER') &&
      currentUserId &&
      (currentUserId === service.seller?.userId || currentUserId === service.freelancerId)
  );
  const canAccessMeet = isTutorOwner || hasBooked;

  const avgResponseTime = useMemo(() => {
    const {hasSeen, createdAt} = service.bookings?.[0] || {};
    if (!hasSeen || !createdAt) return 'En direct';
    const now = moment();
    const created = moment(createdAt);
    const diffHours = now.diff(created, 'hours');
    return diffHours < 1 ? 'Moins d’une heure' : `${diffHours} heures`;
  }, [service.bookings]);

  const sortedPackages = useMemo(
    () =>
      [...service.packages].sort((a, b) => {
        const order = {BASIC: 1, STANDARD: 2, PREMIUM: 3};
        return order[a.name] - order[b.name];
      }),
    [service.packages]
  );

  const currentPackage = useMemo(
    () => sortedPackages.find(pkg => pkg.name === selectedPackage) || sortedPackages[0],
    [sortedPackages, selectedPackage]
  );

  const hasEnoughPoints =
    isFreeTrial ||
    studentPoints === null ||
    (currentPackage ? studentPoints >= currentPackage.price : true);
  const missingPoints =
    !isFreeTrial && studentPoints !== null && currentPackage
      ? Math.max(0, currentPackage.price - studentPoints)
      : 0;

  const rawTutorPhone = ((seller as any)?.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = useMemo(() => {
    const msg = encodeURIComponent(
      `Bonjour Professeur ${sellerName}, je vous contacte depuis 9arrini.me concernant le cours "${displayTitle}" prévu le ${formatScheduleLabel(
        sessionDate,
        sessionTime
      )}.`
    );
    return rawTutorPhone
      ? `https://wa.me/${rawTutorPhone}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
  }, [sellerName, displayTitle, sessionDate, sessionTime, rawTutorPhone]);

  const internalChatUrl = `/dashboard/messages?tutorId=${encodeURIComponent(
    service.freelancerId || service.seller?.userId || ''
  )}&tutorName=${encodeURIComponent(sellerName)}&course=${encodeURIComponent(
    displayTitle
  )}&slug=${encodeURIComponent(service.slug || '')}`;

  const handleQuickRecharge = async (amountToRecharge: number) => {
    setIsRecharging(true);
    try {
      const res = await buyStudentPoints(
        amountToRecharge,
        `Recharge rapide cours (${amountToRecharge} Pts = ${amountToRecharge} DT)`
      );
      if (res.success) {
        const updatedPts = res.newBalance ?? (studentPoints || 0) + amountToRecharge;
        toast.success(res.message || `+${amountToRecharge} Points ajoutés !`);
        setStudentPoints(updatedPts);
        window.dispatchEvent(
          new CustomEvent('9arrini-points-updated', {detail: {points: updatedPts}})
        );
      } else {
        toast.error(res.error || 'Veuillez vous connecter pour recharger vos points.');
      }
    } catch {
      toast.error('Erreur lors de la recharge de points');
    } finally {
      setIsRecharging(false);
    }
  };

  // Booking handler using Points (1 Point = 1 DT)
  const handleBooking = async () => {
    if (hasBooked) {
      toast.info('Vous êtes déjà inscrit(e) à ce cours.');
      return;
    }
    setIsBooking(true);
    try {
      const {disable, role, clientId, name: clientName} = await allowClientOnly();

      if (!role) {
        toast.info('Connectez-vous à votre compte élève pour réserver ce cours.');
        window.location.href = '/auth/login';
        return;
      }

      if (disable) {
        toast.info(`Seuls les comptes élèves (USER) peuvent réserver une séance.`);
        return;
      }

      if (clientId && clientName && currentPackage) {
        const {
          success,
          error,
          message,
          newBalance,
        }: {
          success: boolean;
          error?: string;
          message?: string;
          newBalance?: number;
          insufficientPoints?: boolean;
        } = await bookService({
          serviceName: displayTitle,
          packageName: currentPackage.name,
          packagePrice: currentPackage.price,
          revisions: currentPackage.revisions,
          delivery: currentPackage.delivery,
          role,
          sellerId: service.sellerId,
          serviceId: service.id,
          serviceSlug: service.slug,
          clientId,
          clientName,
          freelancerId: service.freelancerId,
          freelancerName: sellerName,
          scheduledDate: sessionDate,
          scheduledTime: sessionTime,
          meetUrl: initialMeet.meetUrl,
          tutorPhone: (seller as any)?.phone || '',
        });

        if (success) {
          setHasBooked(true);
          try {
            const key = `${BOOKED_SERVICES_STORAGE_KEY}_${clientId}`;
            const existingRaw = localStorage.getItem(key);
            const existingArr: string[] = existingRaw ? JSON.parse(existingRaw) : [];
            const nextArr = Array.from(
              new Set([...existingArr, service.id, service.slug].filter(Boolean))
            );
            localStorage.setItem(key, JSON.stringify(nextArr));
          } catch {
            // ignore
          }

          const computedBalance =
            typeof newBalance === 'number'
              ? newBalance
              : Math.max(0, (studentPoints ?? 50) - currentPackage.price);
          setStudentPoints(computedBalance);
          window.dispatchEvent(
            new CustomEvent('9arrini-points-updated', {detail: {points: computedBalance}})
          );
          toast.success(
            message ||
              `Séance réservée avec succès ! (-${currentPackage.price} Points / ${currentPackage.price} DT) • Le lien Google Meet est débloqué !`
          );
        } else if (error) {
          toast.error(error);
        }
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Impossible de finaliser la réservation');
    } finally {
      setIsBooking(false);
    }
  };

  const formattedDescriptionHtml = useMemo(() => {
    const raw = (service.description || '').trim();
    if (!raw) {
      return `<p>Cours proposé par ${escapeHtml(sellerName)}.</p>`;
    }
    if (raw.includes('<p>') || raw.includes('<h3>') || raw.includes('<h2>') || raw.includes('<ul>')) {
      return sanitizeRichHtml(raw);
    }
    return `<p>${escapeHtml(raw)}</p>`;
  }, [service.description, sellerName]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Title & Meta */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-emerald-600/10 text-emerald-700 border-emerald-500/20 text-xs font-semibold px-2.5 py-1">
                  <GraduationCap className="h-3.5 w-3.5 mr-1" />
                  {service.category?.name || 'Cours'}
                </Badge>
                {isSellerVerified ? (
                  <Badge className="bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    Professeur Vérifié par 9arrini
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-700 text-xs px-2.5 py-1">
                    Professeur 9arrini
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground ml-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">{avgRating}</span>
                  <span className="text-muted-foreground/60">•</span>
                  <span>{reviewCount} avis d&apos;élèves</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 leading-tight">
                {displayTitle}
              </h1>
            </div>

            {/* Media Gallery */}
            <div className="mb-10">
              <ServiceCarousel service={service} />
            </div>

            {/* Detailed Content Sections */}
            <div className="space-y-10">
              {/* Course Description */}
              <section className="rounded-2xl border bg-card p-6 shadow-xs">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  Description & Détails du Cours
                </h2>

                <div
                  className="prose tiptap prose-sm dark:tiptap dark:prose-invert max-w-none border-0! bg-transparent! shadow-none!"
                  dangerouslySetInnerHTML={{__html: formattedDescriptionHtml}}
                />
              </section>

              {/* Seller Profile Card */}
              <section className="p-6 rounded-2xl border bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-emerald-500/30">
                    <AvatarImage
                      loading="eager"
                      src={avatar}
                      alt={sellerName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-base font-bold bg-emerald-100 text-emerald-800">
                      {sellerName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-lg truncate">{sellerName}</h3>
                      {isSellerVerified && (
                        <Badge className="bg-emerald-600 text-white text-xs">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Prof Vérifié ✓
                        </Badge>
                      )}
                    </div>

                    {(sellerSpecialty || sellerCredentials || sellerExperience) && (
                      <div className="flex flex-wrap gap-2 mb-2 text-xs text-muted-foreground">
                        {sellerSpecialty && (
                          <span className="bg-background border px-2 py-0.5 rounded-md font-medium text-foreground">
                            🎓 {sellerSpecialty}
                          </span>
                        )}
                        {sellerCredentials && (
                          <span className="bg-background border px-2 py-0.5 rounded-md">
                            📜 {sellerCredentials}
                          </span>
                        )}
                        {sellerExperience && (
                          <span className="bg-background border px-2 py-0.5 rounded-md">
                            ⏱️ {sellerExperience}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">{avgRating}</span>
                        <span className="text-xs text-muted-foreground ml-1">({reviewCount} avis)</span>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Réponse : {avgResponseTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col gap-2 sm:self-start shrink-0">
                    <Button
                      size="sm"
                      className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold text-xs"
                      asChild
                    >
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                        WhatsApp Prof
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs font-semibold" asChild>
                      <Link href={internalChatUrl}>
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                        Message 9arrini
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs" asChild>
                      <Link href={`/freelancer/${service.freelancerId}`}>
                        Voir Profil Prof
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {service.seller.bio && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.seller.bio}
                    </p>
                  </div>
                )}
              </section>

              {/* FAQ */}
              {service.faqs && service.faqs.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold mb-3">Questions Fréquentes (FAQ)</h2>
                  <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                    {service.faqs.map((faq, index) => (
                      <AccordionItem value={`item-${index + 1}`} key={index}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              )}

              <section>
                <ReviewForm sendCurrentReview={setCurrentReview} serviceId={service.id} />
              </section>
              <section className="lg:block hidden">
                <ReviewDisplay currentReview={currentReview} dbReviews={service.reviews || []} />
              </section>
            </div>
          </div>

          {/* Right Sidebar: Shows EITHER Registered/Unlocked View OR Booking/Payment View */}
          <div className="lg:col-span-1 order-1">
            <div className="sticky top-8 space-y-6">
              <Card className="border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/5 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 px-6 pt-6 bg-gradient-to-r from-emerald-950/5 to-teal-950/5">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>
                      {canAccessMeet
                        ? isTutorOwner
                          ? 'Gestion de votre Séance'
                          : 'Votre Séance Réservée'
                        : 'Choisir un Pack de Cours'}
                    </span>
                    <Badge className="bg-emerald-600 text-white text-xs font-semibold">
                      {canAccessMeet ? 'Inscrit ✓' : '1 Point = 1 DT'}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-6 pb-6 pt-4 space-y-5">
                  {/* Student Live Points Balance Banner */}
                  {studentPoints !== null && (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Votre Solde Points
                          </p>
                          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                            {studentPoints} Points ({studentPoints} DT)
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-emerald-600/30 text-emerald-700 hover:bg-emerald-50"
                        asChild
                      >
                        <Link href="/dashboard/client/points">+ Recharger</Link>
                      </Button>
                    </div>
                  )}

                  {canAccessMeet ? (
                    /* ================= ALREADY PAID & REGISTERED VIEW ================= */
                    <div className="space-y-4">
                      {!isTutorOwner && (
                        <div className="rounded-xl bg-emerald-600 text-white p-3.5 flex items-start gap-2.5 shadow-sm">
                          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                          <div className="text-xs leading-relaxed">
                            <p className="font-bold text-sm">Vous êtes déjà inscrit(e) à ce cours !</p>
                            <p className="opacity-90 mt-0.5">
                              Votre paiement a été validé et votre séance est enregistrée dans vos cours réservés et vos rappels de notifications.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 space-y-3 shadow-md shadow-emerald-500/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            <Video className="h-4 w-4 text-emerald-600" />
                            <span>Séance Google Meet Planifiée</span>
                          </div>
                          <Badge className="bg-emerald-600 text-white text-[10px] font-semibold">
                            {isTutorOwner ? 'Professeur' : 'Accès Débloqué ✓'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                              <Calendar className="h-3 w-3 text-emerald-600" />
                              Date du cours
                            </label>
                            <input
                              type="date"
                              value={sessionDate}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={e => setSessionDate(e.target.value)}
                              className="w-full rounded-lg border border-emerald-300 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-medium text-slate-900 dark:text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                              <Clock className="h-3 w-3 text-emerald-600" />
                              Heure prévue
                            </label>
                            <input
                              type="time"
                              value={sessionTime}
                              onChange={e => setSessionTime(e.target.value)}
                              className="w-full rounded-lg border border-emerald-300 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-medium text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </div>

                        <div className="rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 p-2.5 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 truncate">
                              {initialMeet.meetUrl}
                            </span>
                            <button
                              type="button"
                              onClick={copyMeetUrl}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline shrink-0 cursor-pointer"
                            >
                              <Copy className="h-3 w-3" />
                              Copier
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={initialMeet.meetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2 text-xs font-bold transition"
                            >
                              <Video className="h-3.5 w-3.5" />
                              Rejoindre Meet
                            </a>
                            <a
                              href={liveCalendarUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-2 px-2 text-xs font-semibold transition"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Google Agenda
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-1">
                        <Button
                          asChild
                          className="w-full h-11 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                        >
                          <Link href="/dashboard/client/bookings">
                            <BellRing className="mr-2 h-4 w-4" />
                            Voir dans Mes Cours Réservés
                            <ChevronRight className="ml-1.5 h-4 w-4" />
                          </Link>
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            asChild
                            size="sm"
                            className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold text-xs h-9 rounded-lg"
                          >
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                              WhatsApp Prof
                            </a>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="text-xs font-semibold h-9 rounded-lg"
                          >
                            <Link href={internalChatUrl}>
                              <MessageSquare className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                              Message 9arrini
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ================= NOT YET BOOKED VIEW (CHOOSE PACKAGE & PAY) ================= */
                    <>
                      <div className="space-y-4">
                        <Tabs
                          value={selectedPackage}
                          onValueChange={setSelectedPackage as any}
                          className="w-full"
                        >
                          <TabsList className="grid grid-cols-3 w-full rounded-lg mb-3 h-auto border">
                            {sortedPackages.map((pkg, idx) => (
                              <TabsTrigger
                                key={pkg.id || idx}
                                value={pkg.name}
                                className="rounded-md py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                              >
                                <div className="text-center">
                                  <div className="font-semibold text-xs">{pkg.name}</div>
                                  <div className="text-[11px] opacity-90 mt-0.5">
                                    {pkg.price} Pts ({pkg.price} DT)
                                  </div>
                                </div>
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>

                        {/* Selected Package Details */}
                        {currentPackage && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                                  {currentPackage.price} Points
                                </span>
                                <span className="text-sm font-semibold text-muted-foreground">
                                  ({currentPackage.price} Dinars / DT)
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {currentPackage.description}
                              </p>
                            </div>

                            <Separator />

                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">Durée du programme</span>
                                </div>
                                <span className="font-semibold text-sm">
                                  {currentPackage.delivery} jour
                                  {currentPackage.delivery !== 1 ? 's' : ''}
                                </span>
                              </div>

                              <div className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">Suivi Q&A inclus</span>
                                </div>
                                <span className="font-semibold text-sm">
                                  {currentPackage.revisions} séance
                                  {currentPackage.revisions !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            {/* Locked Google Meet Session Box */}
                            <div className="rounded-xl border border-dashed border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 space-y-3">
                              <div className="flex items-start gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 text-emerald-700 dark:text-emerald-300">
                                  <Lock className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                      Lien Google Meet Protégé
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                                    >
                                      Paiement requis
                                    </Badge>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Le lien Google Meet direct sera débloqué immédiatement après
                                    l&apos;inscription à ce cours ({currentPackage.price} Points ={' '}
                                    {currentPackage.price} DT).
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                                    <Calendar className="h-3 w-3 text-emerald-600" />
                                    Choisir la date
                                  </label>
                                  <input
                                    type="date"
                                    value={sessionDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setSessionDate(e.target.value)}
                                    className="w-full rounded-lg border border-emerald-300 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-medium text-slate-900 dark:text-slate-100"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mb-1">
                                    <Clock className="h-3 w-3 text-emerald-600" />
                                    Choisir l&apos;heure
                                  </label>
                                  <input
                                    type="time"
                                    value={sessionTime}
                                    onChange={e => setSessionTime(e.target.value)}
                                    className="w-full rounded-lg border border-emerald-300 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-medium text-slate-900 dark:text-slate-100"
                                  />
                                </div>
                              </div>

                              <div className="rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-900/50 p-2 flex items-center justify-between text-xs">
                                <span className="text-[11px] text-muted-foreground">
                                  Séance : <strong>{formatScheduleLabel(sessionDate, sessionTime)}</strong>
                                </span>
                                <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">
                                  meet.google.com/•••-••••-•••
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Free Trial Banner */}
                      {isFreeTrial && (
                        <div className="rounded-xl border border-emerald-400/50 bg-emerald-50/90 dark:bg-emerald-950/40 p-3 space-y-1">
                          <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                            🎉 Semaine de lancement : Réservation 100 % Gratuite (0 DT)
                          </p>
                          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-snug">
                            Aucun paiement requis cette semaine ! Après la séance sur Google Meet,
                            notez le professeur pour valider le cours.
                          </p>
                        </div>
                      )}

                      {/* Insufficient Points Quick Top-Up Box */}
                      {!isFreeTrial && studentPoints !== null && !hasEnoughPoints && currentPackage && (
                        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-2.5">
                          <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                            Il vous manque{' '}
                            <strong>
                              {missingPoints} DT
                            </strong>{' '}
                            pour réserver ce pack ({currentPackage.price} DT requis).
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            disabled={isRecharging}
                            onClick={() => handleQuickRecharge(Math.max(missingPoints, 25))}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                          >
                            <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                            {isRecharging
                              ? 'Recharge en cours...'
                              : `Recharger +${Math.max(missingPoints, 25)} DT`}
                          </Button>
                        </div>
                      )}

                      {/* Single Registration & Payment CTA Button */}
                      {currentPackage && (
                        <div className="space-y-3">
                          {!currentUserId ? (
                            <Button
                              type="button"
                              onClick={() => (window.location.href = '/auth/login')}
                              className="w-full h-12 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Se connecter pour réserver (0 DT)
                            </Button>
                          ) : (
                            <Button
                              onClick={handleBooking}
                              disabled={isBooking || !hasEnoughPoints}
                              className="w-full h-12 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all duration-200"
                            >
                              {isBooking ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                  Validation en cours...
                                </>
                              ) : (
                                <>
                                  <Coins className="mr-2 h-4 w-4" />
                                  {isFreeTrial
                                    ? 'Réserver gratuitement (0 DT — Semaine de lancement)'
                                    : `Réserver & Payer (${currentPackage.price} DT)`}
                                  <ChevronRight className="ml-1.5 h-4 w-4" />
                                </>
                              )}
                            </Button>
                          )}

                          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3 text-emerald-600" />
                              <span>Évaluation après la séance</span>
                            </div>
                            <div className="h-3 w-px bg-border" />
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-emerald-600" />
                              <span>Déblocage Google Meet</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Trust Signals */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-gradient-to-r from-emerald-500/10 to-transparent">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">Portefeuille Points 9arrini</p>
                    <p className="text-xs text-muted-foreground truncate">
                      1 Point = 1 DT • Paiement sécurisé et rappel de séance
                    </p>
                  </div>
                </div>
              </div>

              <section className="block lg:hidden">
                <ReviewDisplay currentReview={currentReview} dbReviews={service.reviews || []} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ServiceDetailPage;
