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
} from 'lucide-react';
import type {Service, ServicePackage} from '@/types/service';
import {allowClientOnly} from './validate/allow-user-only';
import {toast} from 'sonner';
import {ServiceCarousel} from '../autoplay-carousel';
import {bookService} from '@/hooks/book/book-service';
import {getStudentPointsData, buyStudentPoints} from '@/hooks/points/points-actions';
import {profilePhoto} from '../profile-url';
import Link from 'next/link';
import moment from 'moment';
import '@/components/editor/styles/tiptap.scss';
import '@/components/editor/styles/utils.css';
import {ReviewDisplay} from './review-display';
import {ReviewForm} from './review-form';
import type {Review} from '@/types/review';

function formatCleanCourseTitle(title: string, sellerName?: string): string {
  const cleaned = (title || '').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length < 5 || cleaned.toLowerCase().startsWith('i teach')) {
    const topic = cleaned.replace(/^i\s+teach\s+/i, '').trim() || 'Soutien Scolaire';
    const capTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    return `Cours & Révision : ${capTopic} — Accompagnement Personnalisé${
      sellerName ? ` avec ${sellerName}` : ''
    }`;
  }
  return cleaned;
}

export function ServiceDetailPage({service}: {service: Service}) {
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage['name']>('BASIC');
  const [isBooking, setIsBooking] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);
  const [avatar, setAvatar] = useState<string>('');
  const [currentReview, setCurrentReview] = useState<Review>();
  const [studentPoints, setStudentPoints] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const reviewCount = service.reviews!.length;
  const avgRating = useMemo(
    () =>
      reviewCount === 0
        ? 0
        : (service.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1),
    [service.reviews, reviewCount]
  );

  const seller = service.seller;
  const sellerName = seller.user.name || 'Professeur 9arrini';
  const isSellerVerified =
    (seller as any)?.isVerified !== false && (seller as any)?.verified !== false;
  const sellerSpecialty = (seller as any)?.specialty;
  const sellerCredentials = (seller as any)?.credentials;
  const sellerExperience = (seller as any)?.experience;

  const displayTitle = formatCleanCourseTitle(service.title, sellerName);

  useEffect(() => {
    const init = async () => {
      const img = await profilePhoto({
        imageUrl: service.seller.user.image,
        imageSource: 'CLOUDINARY',
        email: service.seller.user.email || '',
      });
      setAvatar(img);

      const pointsRes = await getStudentPointsData();
      if (pointsRes.success && pointsRes.user) {
        setStudentPoints(pointsRes.user.points ?? 0);
        setUserRole(pointsRes.user.role ?? null);
      }
    };
    init();
  }, [service.seller.user.image, service.seller.user.email]);

  const avgResponseTime = useMemo(() => {
    const {hasSeen, createdAt} = service.bookings?.[0] || {};
    if (!hasSeen || !createdAt) return 'Moins de 2 heures';
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
    studentPoints === null || (currentPackage ? studentPoints >= currentPackage.price : true);
  const missingPoints =
    studentPoints !== null && currentPackage
      ? Math.max(0, currentPackage.price - studentPoints)
      : 0;

  const handleQuickRecharge = async (amountToRecharge: number) => {
    setIsRecharging(true);
    try {
      const res = await buyStudentPoints(
        amountToRecharge,
        `Recharge rapide cours (${amountToRecharge} Pts = ${amountToRecharge} DT)`
      );
      if (res.success) {
        toast.success(res.message || `+${amountToRecharge} Points ajoutés !`);
        setStudentPoints(res.newBalance ?? (studentPoints || 0) + amountToRecharge);
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
    setIsBooking(true);
    try {
      const {disable, role, clientId, name: clientName} = await allowClientOnly();

      if (!role) {
        toast.info('Connectez-vous à votre compte élève pour réserver ce cours.');
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
          insufficientPoints,
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
        });

        if (success) {
          toast.success(
            message ||
              `Séance réservée avec succès ! (-${currentPackage.price} Points / ${currentPackage.price} DT)`
          );
          if (typeof newBalance === 'number') {
            setStudentPoints(newBalance);
          } else if (studentPoints !== null) {
            setStudentPoints(Math.max(0, studentPoints - currentPackage.price));
          }
        } else if (error) {
          toast.error(error);
          if (insufficientPoints) {
            // Prompt user to recharge
          }
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
    if (raw.includes('<h3>') || raw.includes('<h2>') || raw.includes('<ul>')) {
      return raw;
    }
    const cleanText = raw.replace(/<[^>]*>/g, '').trim();
    return `
      <h3>🎯 Objectifs Pédagogiques de la Séance</h3>
      <p>${cleanText || `Accompagnement personnalisé et structuré en ${service.category?.name || 'Soutien Scolaire'} avec ${sellerName}.`}</p>
      <h3>📚 Programme & Déroulement du Cours</h3>
      <ul>
        <li><strong>Explication claire du cours :</strong> Rappel des notions fondamentales, théorèmes et astuces de résolution rapide.</li>
        <li><strong>Pratique intensive :</strong> Exercices d'application gradués et séries d'examens nationaux corrigés pas à pas.</li>
        <li><strong>Suivi & Support PDF :</strong> Fiche résumé complète envoyée à la fin de la séance + réponses aux questions.</li>
      </ul>
    `;
  }, [service.description, service.category?.name, sellerName]);

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
                  {service.category?.name || 'Soutien Académique'}
                </Badge>
                {isSellerVerified ? (
                  <Badge className="bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    Professeur Vérifié par 9arrini
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-700 text-xs px-2.5 py-1">
                    ⏳ Dossier Prof en cours de confirmation
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
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                    Ce qui est inclus dans chaque séance
                  </h2>
                  <Badge variant="secondary" className="text-xs font-medium">
                    Standard Académique 9arrini
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Séance 1-on-1 en direct avec méthodologie claire',
                    'Fiches de révision & Résumés de cours PDF',
                    'Séries d’exercices & Anciens devoirs corrigés',
                    'Suivi personnalisé & Réponses aux questions (Q&A)',
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3.5 rounded-xl border bg-card hover:border-emerald-500/40 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Structured Academic Description */}
              <section className="rounded-2xl border bg-card p-6 shadow-xs">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Programme & Détails du Cours
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
                      {isSellerVerified ? (
                        <Badge className="bg-emerald-600 text-white text-xs">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Prof Vérifié ✓
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-700">
                          ⏳ En attente de confirmation Admin
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
                        <span>Réponse moyenne : {avgResponseTime}</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="sm:self-start shrink-0" asChild>
                    <Link href={`/freelancer/${service.freelancerId}`}>
                      Voir Profil Prof
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
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
              <section>
                <h2 className="text-xl font-bold mb-3">Questions Fréquentes (FAQ)</h2>
                {service.faqs && service.faqs.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8 text-muted-foreground rounded-lg border">
                    Aucune FAQ supplémentaire pour ce cours.
                  </div>
                )}
              </section>

              <section>
                <ReviewForm sendCurrentReview={setCurrentReview} serviceId={service.id} />
              </section>
              <section className="lg:block hidden">
                <ReviewDisplay currentReview={currentReview} dbReviews={service.reviews || []} />
              </section>
            </div>
          </div>

          {/* Booking Sidebar with Points Wallet Integration */}
          <div className="lg:col-span-1 order-1">
            <div className="sticky top-8 space-y-6">
              <Card className="border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/5 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 px-6 pt-6 bg-gradient-to-r from-emerald-950/5 to-teal-950/5">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Choisir un Pack de Cours</span>
                    <Badge className="bg-emerald-600 text-white text-xs font-semibold">
                      1 Point = 1 DT
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

                  {/* Package Tabs */}
                  <div className="space-y-4">
                    <Tabs
                      value={selectedPackage}
                      onValueChange={setSelectedPackage as any}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-3 w-full rounded-lg mb-3 h-auto border">
                        {sortedPackages.map(pkg => (
                          <TabsTrigger
                            key={pkg.id}
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
                            {currentPackage.delivery} jour{currentPackage.delivery !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Suivi Q&A inclus</span>
                          </div>
                          <span className="font-semibold text-sm">
                            {currentPackage.revisions} séance{currentPackage.revisions !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insufficient Points Quick Top-Up Box */}
                  {studentPoints !== null && !hasEnoughPoints && (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-2.5">
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                        Il vous manque <strong>{missingPoints} Points ({missingPoints} DT)</strong> pour
                        réserver ce pack ({currentPackage.price} Pts requis).
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
                          : `Recharger +${Math.max(missingPoints, 25)} Points (${Math.max(missingPoints, 25)} DT) maintenant`}
                      </Button>
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleBooking}
                      disabled={isBooking}
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
                          Payer avec {currentPackage.price} Points ({currentPackage.price} DT)
                          <ChevronRight className="ml-1.5 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-emerald-600" />
                        <span>Débit Points instantané</span>
                      </div>
                      <div className="h-3 w-px bg-border" />
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-emerald-600" />
                        <span>Accès chat direct prof</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Signals */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-gradient-to-r from-emerald-500/10 to-transparent">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">Garantie 9arrini Points</p>
                    <p className="text-xs text-muted-foreground truncate">
                      1 Point = 1 DT • Sans carte bancaire requise
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
