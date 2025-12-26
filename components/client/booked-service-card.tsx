'use client';

import Link from 'next/link';
import Image from 'next/image';
import {cloudinaryUrl} from '@/lib/cloudinary';
import type {BookedServiceType} from '@/types/bookings';
import {useEffect, useState} from 'react';
import {profilePhoto} from '../profile-url';
import {cn} from '@/lib/utils';

export function BookedServiceCardComponent({service}: {service: BookedServiceType}) {
  const minPrice = Math.min(...service.packages.map(p => p.price)) || 0;
  const [avatar, setAvatar] = useState<string>('');

  const freelancerImageUrl = service.counterparty.image;
  const freelancerMail = service.counterparty.email;
  const imageSource = service.counterparty.imageSource;
  const hasSeen = Boolean(service.hasSeen);

  useEffect(() => {
    const init = async () => {
      const img = await profilePhoto({
        imageSource: imageSource || 'CLOUDINARY',
        imageUrl: freelancerImageUrl,
        email: freelancerMail,
      });
      setAvatar(img);
      console.log(img);
    };
    // console.log(service.freelancer);
    init();
  }, []);

  return (
    <div
      className="
    grid grid-cols-[160px_1fr]
    w-full border border-border
    rounded-lg overflow-hidden
    bg-background shadow-sm
    transition hover:shadow-md
  "
    >
      <Link href={`/service/${service.slug}`} target="_blank">
        <div className="relative h-full min-h-[160px] w-full overflow-hidden">
          <Image
            src={
              service.images[0] ? cloudinaryUrl(service.images[0], 'q_30,f_auto') : '/fallback.jpg'
            }
            preload
            loading="eager"
            alt={service.title}
            width={400}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
      </Link>

      <div className="flex flex-col justify-between p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-2 font-medium',
                hasSeen ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <span className={cn('h-2 w-2', hasSeen ? 'bg-green-500' : 'bg-destructive')} />
              {hasSeen ? 'Seen by seller' : 'Waiting for seller'}
            </span>

            {hasSeen && (
              <span className="text-[11px] text-muted-foreground">
                {service.hasSeen!.toLocaleDateString()}
              </span>
            )}
          </div>

          <Link href={`/service/${service.slug}`} target="_blank">
            <p className="text-sm font-semibold leading-snug line-clamp-2 hover:underline">
              {service.title}
            </p>
          </Link>

          <Link
            href={`/seller/${service.counterparty.id}`}
            target="_blank"
            className="flex items-center gap-2 mt-1  text-xs text-muted-foreground hover:text-foreground"
          >
            <img src={avatar} alt={service.counterparty.name} className="h-5 w-5 object-cover" />
            <span className="font-medium truncate">{service.counterparty.name}</span>
          </Link>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
          <Link
            href={`/service/${service.slug}`}
            target="_blank"
            className="font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            View service
          </Link>

          <span className="font-semibold text-foreground">From ${minPrice}</span>
        </div>
      </div>
    </div>
  );
}
