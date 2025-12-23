'use client';

import Link from 'next/link';
import Image from 'next/image';
import {cloudinaryUrl} from '@/lib/cloudinary';
import type {ServiceCard as ServiceCardType} from '@/types/service';
import {Star, Clock, Heart, Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent} from '@/components/ui/card';
import {useState} from 'react';
import {cn} from '@/lib/utils';

interface EnhancedServiceCardType extends ServiceCardType {
  averageRating: number;
}

export function ServiceCardComponent({service}: {service: EnhancedServiceCardType}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const minPrice = Math.min(...service.packages.map(p => p.price)) || 0;
  const maxPrice = Math.max(...service.packages.map(p => p.price)) || minPrice;
  const reviewCount = service._count.reviews;
  const hasMultiplePrices = minPrice !== maxPrice;
  const deliveryDays = service.packages[0]?.delivery || 3;

  const sellerAvatar =
    (service?.seller?.profilePhoto ? cloudinaryUrl(service.seller?.profilePhoto) : undefined) ||
    `https://api.dicebear.com/6.x/initials/svg?seed=${service.seller.user.name}`;

  const getBadges = () => {
    const badges = [];
    if (service._count.bookings > 50) badges.push({text: 'Popular', variant: 'default' as const});
    if (service.averageRating >= 4.5)
      badges.push({text: 'Top Rated', variant: 'secondary' as const});
    if (deliveryDays <= 1) badges.push({text: 'Fast', variant: 'outline' as const});
    return badges.slice(0, 2);
  };

  const badges = getBadges();

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 h-full hover:shadow-lg border',
        'border-none shadow-none hover:shadow-none relative',
        isHovered && 'shadow-md'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={
            service.images[0]?.length > 1
              ? cloudinaryUrl(service.images[0], 'q_40,f_auto,w_600')
              : '/placeholder.jpg'
          }
          alt={service.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover h-full transition-transform duration-500 group-hover:scale-[102%]"
        />

        {isHovered && service.packages[0].id && (
          <CardContent
            className={cn(
              'absolute h-60 aspect-video w-full overflow-hidden inset-0 bottom-full mb-2 bg-secondary/50 p-4 z-50 ',
              'transition-all duration-500 group-hover:backdrop-blur-xs'
            )}
          >
            <div className="space-y-3 tracking-tighter">
              <h4 className="font-semibold tracking-tighter text-sm">Popular Packages</h4>
              {service.packages.slice(0, 2).map((pkg, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-foreground flex-shrink-0" />
                  <p className="text-xs text-foreground group-hover:underline ">
                    ${pkg.price} • {pkg.delivery} days
                  </p>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                <Link href={`/service/${service.slug}`}>Compare all packages</Link>
              </Button>
            </div>
          </CardContent>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Row Badges & Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant} className="text-xs px-2 py-1 font-medium">
                {badge.text}
              </Badge>
            ))}
          </div>

          {/* Like Button */}
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
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
        {/* Seller Info */}
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-full">
            <Image
              src={sellerAvatar}
              alt={service.seller.user.name}
              fill
              className="object-cover"
            />
          </div>
          <Link
            href={`/seller/${service.seller.user.id}`}
            className="text-sm font-medium hover:underline truncate"
            onClick={e => e.stopPropagation()}
          >
            {service.seller.user.name}
          </Link>
        </div>

        {/* Title */}
        <Link href={`/service/${service.slug}`} className="block">
          <h3 className="font-semibold leading-tight line-clamp-2 text-base group-hover:underline transition-colors">
            {service.title}
          </h3>
        </Link>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="font-semibold">{service.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>

            {/* Delivery Time */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {deliveryDays} day{deliveryDays !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Orders Count */}
          <div className="text-muted-foreground">{service._count.bookings} orders</div>
        </div>

        {/* {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            {service.tags.slice(0, 3).map(tag => (
              <span
                key={tag.id}
                className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )} */}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">${minPrice}</span>
              {hasMultiplePrices && (
                <span className="text-sm text-muted-foreground">- ${maxPrice}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Starting price</p>
          </div>

          {/* <Button size="sm" className="gap-2">
            <Zap className="h-4 w-4" />
            View
          </Button> */}
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
