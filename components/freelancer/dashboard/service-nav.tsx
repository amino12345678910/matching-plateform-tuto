'use client';

import Link from 'next/link';
import {cn} from '@/lib/utils';
import moment from 'moment';
import type {ServiceCardLite} from '@/types/service-lite';
import type {ServiceNavLite} from '@/hooks/freelancers/dashboard/get-my-services-lite';
import {defaultRoute} from '@/app/(freelancer-client)/dashboard/freelancer/config';
import {getServiceMeetInfo} from '@/lib/google-meet';
import {Video, Calendar, Copy} from 'lucide-react';
import {toast} from 'sonner';

export function ServiceNav({services}: {services: ServiceNavLite[]}) {
  if (!services.length) {
    return (
      <div className="rounded-xl border bg-muted/40 p-6 text-sm text-muted-foreground">
        Vous n’avez pas encore publié de séance de cours.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Vos Séances & Liens Google Meet</h3>
        <Link
          href={`${defaultRoute}/manage`}
          className="text-xs font-medium text-muted-foreground hover:underline"
        >
          Voir tout
        </Link>
      </header>

      <ul className="divide-y">
        {services.map(service => {
          const minPrice = Math.min(...service.packages.map(p => p.price));
          const lastUpdated = moment(service.updatedAt).fromNow();
          const meetInfo = getServiceMeetInfo(service as any);

          return (
            <li
              key={service.id}
              className="group flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-muted/40 transition"
            >
              {/* STATUS */}
              <StatusDot status={service.status} />

              {/* TITLE + MEET SCHEDULE */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`${defaultRoute}/service/${service.slug}`}
                  className="block truncate text-sm font-medium hover:underline"
                >
                  {service.title}
                </Link>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>
                    {service._count.bookings} réservations · {service._count.reviews} avis
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <Calendar className="h-3 w-3" />
                    {meetInfo.formattedDateLabel}
                  </span>
                </div>
              </div>

              {/* GOOGLE MEET QUICK LAUNCH */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(meetInfo.meetUrl);
                    toast.success('Lien Google Meet copié !');
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium cursor-pointer"
                  title={meetInfo.meetUrl}
                >
                  <Copy className="h-3 w-3" />
                  <span className="hidden sm:inline font-mono">{meetInfo.meetCode}</span>
                </button>
                <a
                  href={meetInfo.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Google Meet</span>
                </a>
              </div>

              {/* PRICE */}
              <div className="hidden sm:block text-xs text-muted-foreground">
                Dès <span className="font-semibold text-emerald-700">{minPrice} Pts ({minPrice} DT)</span>
              </div>

              {/* UPDATED */}
              <div className="hidden lg:block text-xs text-muted-foreground">
                Mis à jour {lastUpdated}
              </div>

              {/* ACTION */}
              <Link
                href={`${defaultRoute}/service/${service.slug}`}
                className="text-xs font-medium opacity-0 group-hover:opacity-100 transition"
              >
                Gérer →
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatusDot({status}: {status: ServiceCardLite['status']}) {
  return (
    <span
      className={cn(
        'h-2.5 w-2.5 rounded-full',
        status === 'ACTIVE' && 'bg-green-500',
        status === 'PAUSED' && 'bg-yellow-500',
        status === 'DRAFT' && 'bg-gray-400',
        status === 'REJECTED' && 'bg-red-500'
      )}
    />
  );
}
