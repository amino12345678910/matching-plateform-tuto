'use client';

import {useMemo} from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type {BookingLite} from '@/types/bookings-lite';
import Link from 'next/link';

export default function BookedServiceAccordian({bookings}: {bookings: BookingLite[]}) {
  if (!bookings.length) {
    return (
      <div className="mt-10 text-sm text-muted-foreground">
        You haven’t booked any services yet.
      </div>
    );
  }

  const bookingWithPkg = useMemo(() => {
    return bookings.map(booking => ({
      ...booking,
      pkg: booking.service.packages.find(pkg => pkg.name == booking.servicePackageTier),
    }));
  }, [bookings]);

  return (
    <div className="w-full max-w-3xl mt-10">
      <h2 className="text-lg font-semibold mb-4">Your Bookings</h2>

      {bookingWithPkg.map(booking => {
        return (
          <Accordion
            key={booking.id}
            type="single"
            collapsible
            className="mb-3 rounded-md bg-muted"
          >
            <AccordionItem value={booking.id}>
              <AccordionTrigger className="px-4 py-3">
                <div className="flex justify-between w-full">
                  <div>
                    <p className="text-sm font-medium">{booking.servicePackageTier} Package</p>
                    <Link
                      href={`/service/${booking.service.slug}`}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      {booking.service.title}
                    </Link>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold no-underline hover:no-underline!
                        ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {booking.status}
                    </span>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4 space-y-3">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    Delivery time: <span className="font-medium">{booking.pkg?.delivery} days</span>
                  </li>
                  <li>
                    Revisions: <span className="font-medium">{booking.pkg?.revisions}</span>
                  </li>
                  <li>
                    Price: <span className="font-medium">${booking.pkg?.price}</span>
                  </li>
                </ul>

                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Seller: <span className="font-medium">{booking.seller?.user.name}</span>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
}
