'use client';

import Link from 'next/link';
import Image from 'next/image';
import {useEffect, useState} from 'react';
import {cloudinaryUrl} from '@/lib/cloudinary';
import {profilePhoto} from '../profile-url';
import {cn} from '@/lib/utils';
import type {BookedServiceType} from '@/types/bookings';

export function FreelancerBookedServiceCard({service}: {service: BookedServiceType}) {
  const minDelivery = Math.min(...service.packages.map(p => p.delivery)) || 0;

  const [avatar, setAvatar] = useState('');

  const client = service.counterparty;
  const hasSeen = Boolean(service.hasSeen);

  useEffect(() => {
    const init = async () => {
      const img = await profilePhoto({
        imageSource: client.imageSource || 'CLOUDINARY',
        imageUrl: client.image,
        email: client.email,
      });
      setAvatar(img);
    };

    init();
  }, [client]);

  return (
    <div
      className="
        grid grid-cols-[160px_1fr]
        w-full rounded-lg border border-border
        bg-background overflow-hidden
        shadow-sm transition hover:shadow-md
      "
    >
      <Link href={`/service/${service.slug}`} target="_blank">
        <div className="relative h-full min-h-[160px] w-full overflow-hidden">
          <Image
            src={
              service.images[0] ? cloudinaryUrl(service.images[0], 'q_30,f_auto') : '/fallback.jpg'
            }
            alt={service.title}
            width={400}
            height={400}
            className="h-full w-full object-cover"
            loading="eager"
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
              <span
                className={cn('h-2 w-2 rounded-full', hasSeen ? 'bg-green-500' : 'bg-primary')}
              />
              {hasSeen ? 'Client viewed service' : 'New booking'}
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

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <img src={avatar} alt={client.name} className="h-5 w-5 rounded-full object-cover" />
            <span className="font-medium truncate">Ordered by {client.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
          <span className="text-muted-foreground">
            Delivery in <span className="font-semibold text-foreground">{minDelivery} days</span>
          </span>

          <Link
            href={`/service/${service.slug}`}
            className="font-medium text-primary hover:underline"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
