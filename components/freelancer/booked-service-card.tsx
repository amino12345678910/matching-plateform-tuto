'use client';

import Link from 'next/link';
import Image from 'next/image';
import {useEffect, useState} from 'react';
import {cloudinaryUrl} from '@/lib/cloudinary';
import {profilePhoto} from '../profile-url';
import {cn} from '@/lib/utils';
import type {BookedServiceType} from '@/types/bookings';
import {getServiceMeetInfo} from '@/lib/google-meet';
import {Video, Calendar, Copy, ExternalLink} from 'lucide-react';
import {toast} from 'sonner';

export function FreelancerBookedServiceCard({service}: {service: BookedServiceType}) {
  const minDelivery = Math.min(...service.packages.map(p => p.delivery)) || 0;

  const [avatar, setAvatar] = useState('');

  const client = service.counterparty;
  const hasSeen = Boolean(service.hasSeen);
  const meetInfo = getServiceMeetInfo({
    slug: service.slug,
    title: service.title,
  });

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
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] w-full rounded-xl border border-border bg-background overflow-hidden shadow-sm transition hover:shadow-md">
      <Link href={`/service/${service.slug}`} target="_blank">
        <div className="relative h-40 sm:h-full min-h-[160px] w-full overflow-hidden">
          <Image
            src={
              service.images[0]
                ? cloudinaryUrl(service.images[0], 'q_30,f_auto')
                : '/assets/tutoring-academy.jpg'
            }
            alt={service.title}
            width={400}
            height={400}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>
      </Link>

      <div className="flex flex-col justify-between p-4 gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-2 font-medium',
                hasSeen ? 'text-foreground' : 'text-emerald-700'
              )}
            >
              <span
                className={cn('h-2 w-2 rounded-full', hasSeen ? 'bg-green-500' : 'bg-primary')}
              />
              {hasSeen ? 'Séance vue' : 'Nouvelle réservation élève'}
            </span>

            {hasSeen && (
              <span className="text-[11px] text-muted-foreground">
                {new Date(service.hasSeen!).toLocaleDateString()}
              </span>
            )}
          </div>

          <Link href={`/service/${service.slug}`} target="_blank">
            <p className="text-sm font-semibold leading-snug line-clamp-2 hover:underline">
              {service.title}
            </p>
          </Link>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <img
              src={avatar || '/avatar.png'}
              alt={client.name}
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="font-medium truncate">Réservé par {client.name}</span>
          </div>

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
                className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-2 text-[11px] font-semibold"
              >
                <Video className="h-3 w-3" />
                Lancer Google Meet
              </a>
              <a
                href={meetInfo.googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 rounded border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-800 py-1 px-2 text-[11px] font-semibold"
              >
                <ExternalLink className="h-3 w-3" />
                Agenda
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
          <span className="text-muted-foreground">
            Durée : <span className="font-semibold text-foreground">{minDelivery} jours</span>
          </span>

          <Link
            href={`/service/${service.slug}`}
            className="font-medium text-primary hover:underline"
          >
            Voir détails
          </Link>
        </div>
      </div>
    </div>
  );
}
