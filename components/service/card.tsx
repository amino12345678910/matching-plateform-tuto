'use client';

import Link from 'next/link';
import Image from 'next/image';
import {cloudinaryUrl} from '@/lib/cloudinary';
import type {ServiceCard as ServiceCardType} from '@/types/service';

export function ServiceCardComponent({service}: {service: ServiceCardType}) {
  const minPrice = Math.min(...service.packages.map(p => p.price)) || 0;
  const reviewCount = service._count.reviews;

  const sellerAvatar =
    (service?.seller?.profilePhoto ? cloudinaryUrl(service.seller?.profilePhoto) : undefined) ||
    `https://api.dicebear.com/6.x/initials/svg?seed=${service.seller.user.name}`;

  return (
    <div
      className="
        group w-full overflow-hidden rounded-xl border border-gray-200
        bg-card shadow-sm transition-all duration-300
        hover:shadow-md hover:border-gray-300
      "
    >
      <div className="relative h-48 sm:h-40 w-full overflow-hidden bg-gray-100">
        <Image
          src={
            service.images[0].length > 1
              ? cloudinaryUrl(service.images[0], 'q_30,f_auto')
              : '/fallback.jpg'
          }
          alt={service.title}
          priority
          width={500}
          height={300}
          className="
            h-full w-full object-cover
            transition-transform duration-500
            group-hover:scale-[1.03]
          "
        />
      </div>

      <div className="flex flex-col justify-around h-auto p-3 space-y-3">
        <header>
          <Link
            href={`/seller/${service.seller.user.id}`}
            target="_blank"
            className="flex items-center gap-2 transition"
          >
            <img
              src={sellerAvatar}
              alt={service.seller.user.name}
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="text-[11px] font-medium text-foreground truncate">
              {service.seller.user.name}
            </span>
          </Link>
        </header>
        <Link href={`/service/${service.slug}`} target="_blank">
          <p
            className="
              text-sm font-semibold leading-snug text-gray-900
              line-clamp-2 hover:underline
            "
          >
            {service.title}
          </p>
        </Link>
        <div className="flex items-center justify-between text-xs text-foreground">
          <span className="mt-1">{reviewCount > 0 ? `⭐ ${reviewCount}` : 'No reviews yet'}</span>
          <span className="font-semibold text-gray-900">From ${minPrice}</span>
        </div>
      </div>
    </div>
  );
}
