'use server';

import {getUserInfo} from '@/hooks/shared/get-user-info';
import {getMyBookings} from '@/hooks/shared/get-my-bookings';
import type {BookedServiceType} from '@/types/bookings';
import {BookedServiceCardComponent} from '@/components/client/booked-service-card';

async function Page() {
  const user = await getUserInfo();

  if (!user) {
    return null;
  }

  const services: BookedServiceType[] = await getMyBookings({user});

  return (
    <section className="w-full max-w-6xl">
      <header className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Booked services</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Services you have purchased and are currently in progress
        </p>
      </header>

      {services.length === 0 ? (
        <div
          className="
            flex flex-col items-start
            border border-border
            p-6
          "
        >
          <p className="text-sm font-medium text-foreground">No bookings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When you book a service, it will appear here with its status and seller details.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {services.length} active booking{services.length > 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map(service => (
              <BookedServiceCardComponent key={service.id} service={service} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default Page;
