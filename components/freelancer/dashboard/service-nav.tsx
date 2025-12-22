'use client';

import Link from 'next/link';
import {cn} from '@/lib/utils';
import moment from 'moment';
import type {ServiceCardLite} from '@/types/service-lite';
import type {ServiceNavLite} from '@/hooks/freelancers/dashboard/get-my-services-lite';
import {defaultRoute} from '@/app/(freelancer-client)/dashboard/freelancer/config';

export function ServiceNav({services}: {services: ServiceNavLite[]}) {
  if (!services.length) {
    return (
      <div className="rounded-xl border bg-muted/40 p-6 text-sm text-muted-foreground">
        You haven’t created any services yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Your Services</h3>
        <Link
          href={`${defaultRoute}/manage`}
          className="text-xs font-medium text-muted-foreground hover:underline"
        >
          View all
        </Link>
      </header>

      <ul className="divide-y">
        {services.map(service => {
          const minPrice = Math.min(...service.packages.map(p => p.price));
          const lastUpdated = moment(service.updatedAt).fromNow();

          return (
            <li
              key={service.id}
              className="group flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition"
            >
              {/* STATUS */}
              <StatusDot status={service.status} />

              {/* TITLE */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`${defaultRoute}/service/${service.slug}`}
                  className="block truncate text-sm font-medium hover:underline"
                >
                  {service.title}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {service._count.bookings} bookings · {service._count.reviews} reviews
                </div>
              </div>

              {/* PRICE */}
              <div className="hidden sm:block text-xs text-muted-foreground">
                From <span className="font-medium text-foreground">${minPrice}</span>
              </div>

              {/* UPDATED */}
              <div className="hidden md:block text-xs text-muted-foreground">
                Updated {lastUpdated}
              </div>

              {/* ACTION */}
              <Link
                href={`${defaultRoute}/service/${service.slug}`}
                className="text-xs font-medium opacity-0 group-hover:opacity-100 transition"
              >
                Manage →
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
