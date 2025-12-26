'use server';

import Link from 'next/link';
import {Card, CardContent} from '@/components/ui/card';
import {ManageServiceCardComponent} from '@/components/freelancer/dashboard/manage/service-card';
import PackagesCard from '@/components/freelancer/dashboard/manage/packages-card';
import getMyServices from '@/hooks/freelancers/get-my-services';
import type {ServiceCardLite} from '@/types/service-lite';

async function Page() {
  const services: ServiceCardLite[] = (await getMyServices()) || [];

  const bookedServices = services.filter(service =>
    service.bookings?.some(b => b.serviceId === service.id)
  );

  return (
    <div className="container max-w-7xl mx-auto px-6 py-10 space-y-12">
      {services.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <h2 className="text-lg font-semibold">No services yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first service to start receiving bookings and earning.
            </p>
            <Link
              href="/dashboard/create-service"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Create Service
            </Link>
          </CardContent>
        </Card>
      )}

      {services.length > 0 && (
        <>
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Recent Bookings</h2>
              <p className="text-sm text-muted-foreground">Latest activity across your services</p>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-0">
                {bookedServices.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">No bookings yet.</div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto divide-y">
                    {bookedServices.map(service =>
                      service.bookings!.map(booking => (
                        <div key={booking.id} className="p-4">
                          <PackagesCard booking={booking} service={service} />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Services</h2>
              <span className="text-sm text-muted-foreground">{services.length} total</span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {services.map(service => (
                <ManageServiceCardComponent key={service.id} service={service} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Page;
