'use client';

import Link from 'next/link';
import Image from 'next/image';
import {cloudinaryUrl} from '@/lib/cloudinary';
import type {BookedServiceType} from '@/types/bookings';
import {useEffect, useState} from 'react';
import {profilePhoto} from '../profile-url';
import {cn} from '@/lib/utils';
import {getServiceMeetInfo} from '@/lib/google-meet';
import {Video, Calendar, Copy, ExternalLink, MessageCircle, MessageSquare} from 'lucide-react';
import {toast} from 'sonner';

export function BookedServiceCardComponent({service}: {service: BookedServiceType}) {
  const minPrice = Math.min(...service.packages.map(p => p.price)) || 0;
  const [avatar, setAvatar] = useState<string>('');

  const freelancerImageUrl = service.counterparty.image;
  const freelancerMail = service.counterparty.email;
  const imageSource = service.counterparty.imageSource;
  const hasSeen = Boolean(service.hasSeen);
  const rawService = service as any;

  const meetInfo = getServiceMeetInfo({
    slug: service.slug,
    title: service.title,
    scheduledDate: rawService.scheduledDate,
    scheduledTime: rawService.scheduledTime,
    meetLink: rawService.meetLink,
    seller: {user: {name: service.counterparty.name}},
  });

  const cleanPhone = (rawService.tutorPhone || '+21622410112').replace(/[^0-9]/g, '');
  const whatsappMessage = encodeURIComponent(
    `Bonjour Professeur ${service.counterparty.name}, j'ai réservé votre cours "${service.title}" sur 9arrini.me prévu le ${meetInfo.formattedDateLabel} (Lien Google Meet : ${meetInfo.meetUrl}).`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone || '21622410112'}?text=${whatsappMessage}`;
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] w-full border border-border rounded-xl overflow-hidden bg-background shadow-sm transition hover:shadow-md">
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
                'inline-flex items-center gap-2 font-medium',
                hasSeen ? 'text-foreground' : 'text-emerald-700'
              )}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {hasSeen ? 'Confirmé par le professeur' : 'Séance réservée & payée'}
            </span>

            {hasSeen && (
              <span className="text-[11px] text-muted-foreground">
                {new Date(service.hasSeen!).toLocaleDateString()}
              </span>
            )}
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
                  navigator.clipboard.writeText(meetInfo.meetUrl);
                  toast.success('Lien Google Meet copié !');
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
                Rejoindre Meet
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
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
          <Link
            href={`/service/${service.slug}`}
            className="font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            Voir les détails du cours
          </Link>

          <span className="font-semibold text-emerald-700">
            Payé : {minPrice} Pts ({minPrice} DT)
          </span>
        </div>
      </div>
    </div>
  );
}
