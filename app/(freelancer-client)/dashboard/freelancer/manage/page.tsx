'use server';

import {ManageServiceCardComponent} from '@/components/freelancer/dashboard/manage/service-card';
import PackagesCard from '@/components/freelancer/dashboard/manage/packages-card';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import getMyServices from '@/hooks/freelancers/get-my-services';
import Link from 'next/link';
import type {ServiceCardLite} from '@/types/service-lite';

async function Page() {
  const services: ServiceCardLite[] = (await getMyServices()) || [];

  const filteredBooking = services.filter(service =>
    service?.bookings!.some(booking => booking.serviceId === service.id && service)
  );

  return (
    <div className="container md:max-w-7xl mx-auto py-12 pt-8 px-6">
      <h3 className="text-lg font-semibold  text-left mb-10">Your Services</h3>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-sm text-foreground">You haven't created any services yet.</p>
          <Link
            href="/dashboard/create-service"
            className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            Create Service
          </Link>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center mx-auto w-full">
          <Card className="w-full mb-10 shadow-md rounded-lg border border-border">
            <CardHeader className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
              <p className="text-sm text-muted-foreground">Latest activity across your services</p>
            </CardHeader>
            <CardContent className="px-2 py-4 max-h-72 scroll-m-1  overflow-y-scroll">
              {filteredBooking.map(service =>
                service.bookings!.map(booking => {
                  return <PackagesCard key={service.slug} booking={booking} service={service} />;
                })
              )}
            </CardContent>
          </Card>

          {/* Services grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {services.map(service => (
              <ManageServiceCardComponent key={service.id} service={service} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
