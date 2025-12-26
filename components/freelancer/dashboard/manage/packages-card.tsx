'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type {ServiceCardLite as ServiceType} from '@/types/service-lite';

import {AccordionLogger} from './accordion-logger';
import Image from 'next/image';
import {profilePhoto} from '@/components/profile-url';
import {useEffect, useState} from 'react';
import {updateBookingStatus} from '@/hooks/freelancers/update-book-status';
import {Button} from '@/components/ui/button';

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
        <AccordionTrigger className="p-0 hover:no-underline">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center font-semibold">
                {booking.servicePackageTier[0]}
              </div>

              <div className="text-left">
                <p className="text-sm font-medium">{booking.servicePackageTier} Package</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{service.title}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold">${pkg?.price}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="pt-4 space-y-4">
          {/* Client */}
          <div className="flex items-center gap-3">
            <Image src={photo} alt={client.name} width={32} height={32} className="rounded-full" />
            <div>
              <p className="text-sm font-medium">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.email}</p>
            </div>
          </div>

          {/* Package Info */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Delivery</p>
              <p className="font-medium">{pkg?.delivery} days</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revisions</p>
              <p className="font-medium">{pkg?.revisions}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-medium">${pkg?.price}</p>
            </div>
          </div>

          {booking.status === 'PENDING' && !statusChanged && (
            <div className="flex gap-3 pt-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
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
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
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
              >
                Reject
              </Button>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
