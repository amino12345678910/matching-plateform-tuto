'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type {ServiceCardLite as ServiceType} from '@/types/service-lite';

import Link from 'next/link';
import {AccordionLogger} from './accordion-logger';
import Image from 'next/image';
import {profilePhoto} from '@/components/profile-url';
import {useEffect, useState} from 'react';
import {updateBookingStatus} from '@/hooks/freelancers/update-book-status';
import {defaultRoute} from '@/app/(freelancer-client)/dashboard/freelancer/config';

export default function PackagesCard({
  booking,
  service,
}: {
  booking: ServiceType['bookings'][number];
  service: ServiceType;
}) {
  const [photo, setPhoto] = useState('');
  const [statusChanged, setStatusChanged] = useState(false);
  const pkg = booking.service.packages.find(p => p.name === booking.servicePackageTier);

  const client = booking.client;

  useEffect(() => {
    const init = async () => {
      const imageSource = client.imageSource as 'GOOGLE' | 'CLOUDINARY' | 'NULL' | null;
      const userPhoto = await profilePhoto({
        imageSource: imageSource ?? null,
        imageUrl: client.image!,
      });
      // console.log('imageSource', imageSource, '--', userPhoto);
      setPhoto(userPhoto);
    };
    init();
  }, []);

  return (
    <Accordion
      key={booking.id}
      type="single"
      collapsible
      className="flex items-center justify-between p-4 mb-3 rounded-md bg-muted hover:bg-accent transition-colors"
    >
      <AccordionLogger id={`booking-${booking.id}`} />
      <AccordionItem value={`booking-${booking.id}`} className="w-full">
        <AccordionTrigger className="w-full flex justify-between p-0 hover:no-underline">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center font-bold">
              {booking.servicePackageTier[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground hover:underline">
                {booking.servicePackageTier} Package
              </p>
              <Link href={`${defaultRoute}/service/${service.slug}`} className="h-fit w-fit">
                <p className="text-xs text-muted-foreground hover:underline">{service.title}</p>
              </Link>
            </div>
          </div>
          <div className="text-right self-baseline">
            {statusChanged ||
              (booking.status === 'PENDING' && (
                <div className="flex gap-2 pt-3">
                  <span
                    onClick={async () => {
                      const {success, error} = await updateBookingStatus({
                        bookingId: booking.id,
                        freelancerId: booking.freelancerId,
                        status: 'CONFIRMED',
                      });
                      if (error) return console.log(error);
                      if (success) {
                        setStatusChanged(true);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
                  >
                    Accept Booking
                  </span>

                  <span
                    // type=""
                    onClick={async () => {
                      const {success, error} = await updateBookingStatus({
                        bookingId: booking.id,
                        freelancerId: booking.freelancerId,
                        status: 'CANCELLED',
                      });
                      if (error) return console.log(error);
                      if (success) {
                        setStatusChanged(true);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Cancel Booking
                  </span>
                </div>
              ))}

            <p className="text-xs text-muted-foreground mt-1">
              {new Date(booking.createdAt).toLocaleDateString()}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="mt-3 space-y-3">
          <div className="flex items-center gap-3 relative">
            <Image
              src={photo}
              alt={client.name}
              height={10}
              width={10}
              className="h-8 w-8 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.email}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Package Details</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>
                Delivery time: <span className="font-medium">{pkg?.delivery}</span>
              </li>
              <li>
                Revisions included: <span className="font-medium">{pkg?.revisions}</span>
              </li>
              <li>
                Price: <span className="font-medium">${pkg?.price}</span>
              </li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
