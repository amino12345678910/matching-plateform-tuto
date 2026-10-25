'use client';

import Link from 'next/link';
import Image from 'next/image';
import {cloudinaryUrl} from '@/lib/cloudinary';
import type {ServiceCard as ServiceCardType} from '@/types/service';
import {Star, Clock, Heart, Check, ShieldCheck, GraduationCap, Coins} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent} from '@/components/ui/card';
import {useState} from 'react';
import {cn} from '@/lib/utils';

interface EnhancedServiceCardType extends ServiceCardType {
  averageRating: number;
}

const FALLBACK_COURSE_IMAGE =
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80';

export function ServiceCardComponent({service}: {service: EnhancedServiceCardType}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const minPrice = Math.min(...service.packages.map(p => p.price)) || 0;
  const maxPrice = Math.max(...service.packages.map(p => p.price)) || minPrice;
  const reviewCount = service._count.reviews;
  const hasMultiplePrices = minPrice !== maxPrice;
  const deliveryDays = service.packages[0]?.delivery || 3;

  const isSellerVerified = Boolean(
    (service.seller as any)?.isVerified === true || service.seller?.verified === true
  );
  const displayTitle = (service.title || '').trim();
  const imageSrc =
    service.images && service.images.length > 0 && service.images[0]
      ? cloudinaryUrl(service.images[0], 'q_40,f_auto,w_600')
      : FALLBACK_COURSE_IMAGE;

  const sellerAvatar =
    (service?.seller?.user as any)?.image ||
    (service?.seller?.profilePhoto ? cloudinaryUrl(service.seller?.profilePhoto) : undefined) ||
    `https://api.dicebear.com/6.x/initials/svg?seed=${service.seller.user.name}`;

  const getBadges = () => {
    const badges = [];
    if (service._count.bookings > 20)
      badges.push({text: '🔥 Populaire', variant: 'default' as const});
    if (service.averageRating >= 4.5)
      badges.push({text: '⭐ Top Prof', variant: 'secondary' as const});
    if (deliveryDays <= 2) badges.push({text: '⚡ Intensif', variant: 'outline' as const});
    return badges.slice(0, 2);
  };

  const badges = getBadges();

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 h-full hover:shadow-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-card',
        isHovered && 'shadow-lg border-emerald-500/40'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt={displayTitle}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover h-full transition-transform duration-500 group-hover:scale-[103%]"
        />

        {isHovered && service.packages[0]?.id && (
          <CardContent
            className={cn(
              'absolute h-60 aspect-video w-full overflow-hidden inset-0 bottom-full mb-2 bg-slate-950/85 text-white p-4 z-40',
              'transition-all duration-300 backdrop-blur-sm flex flex-col justify-between'
            )}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                  Packs de Drous disponibles
                </h4>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  1 Pt = 1 DT
                </span>
              </div>
              {service.packages.slice(0, 3).map((pkg, index) => (
                <div key={index} className="flex items-center justify-between text-xs border-b border-white/10 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="font-medium">{pkg.name}</span>
                  </div>
                  <span className="font-bold text-emerald-300">
                    {pkg.price} Pts ({pkg.price} DT) • {pkg.delivery}j
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-none"
              asChild
            >
              <Link href={`/service/${service.slug}`}>Voir le programme complet →</Link>
            </Button>
          </CardContent>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        {/* Top Row Badges & Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-wrap gap-1.5">
            {service.category?.name && (
              <Badge className="bg-slate-900/80 text-white hover:bg-slate-900 text-[11px] px-2.5 py-0.5 backdrop-blur-sm">
                <GraduationCap className="h-3 w-3 mr-1 text-emerald-400" />
                {service.category.name}
              </Badge>
            )}
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant} className="text-[11px] px-2 py-0.5 font-medium">
                {badge.text}
              </Badge>
            ))}
          </div>

          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 z-50 rounded-full bg-background/85 backdrop-blur-sm hover:bg-background"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isLiked && 'fill-destructive text-destructive'
              )}
            />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 space-y-3">
        {/* Seller Info + Verification Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-emerald-500/20 shrink-0">
              <Image
                src={sellerAvatar}
                alt={service.seller.user.name}
                fill
                className="object-cover"
              />
            </div>
            <Link
              href={`/freelancer/${service.seller.user.id}`}
              className="text-sm font-semibold hover:underline truncate"
              onClick={e => e.stopPropagation()}
            >
              {service.seller.user.name}
            </Link>
          </div>

          {isSellerVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              Prof Vérifié
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
              En confirmation
            </span>
          )}
        </div>

        {/* Clean Formatted Title */}
        <Link href={`/service/${service.slug}`} className="block">
          <h3 className="font-bold leading-snug line-clamp-2 text-base group-hover:text-emerald-700 transition-colors min-h-[2.75rem]">
            {displayTitle}
          </h3>
        </Link>

        {/* Structured Academic Format Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] bg-muted px-2 py-0.5 rounded-md text-muted-foreground font-medium">
            ✓ Séance 1-on-1
          </span>
          <span className="text-[11px] bg-muted px-2 py-0.5 rounded-md text-muted-foreground font-medium">
            ✓ Résumé & Séries PDF
          </span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span className="font-bold">{service.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {deliveryDays} jour{deliveryDays !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="text-muted-foreground font-medium">
            {service._count.bookings} élève{service._count.bookings !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Price in Points & DT */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="inline-flex items-center gap-1 text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                <Coins className="h-4 w-4 text-emerald-600" />
                {minPrice} Pts
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                ({minPrice} DT{hasMultiplePrices ? ` - ${maxPrice} DT` : ''})
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Payable avec Solde Points (1 Pt = 1 DT)</p>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold border-emerald-500/30 text-emerald-700 hover:bg-emerald-50"
            asChild
          >
            <Link href={`/service/${service.slug}`}>Réserver</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServiceCards({services}: {services: EnhancedServiceCardType[]}) {
  return (
    <>
      {services.map(service => (
        <ServiceCardComponent key={service.id} service={service} />
      ))}
    </>
  );
}
