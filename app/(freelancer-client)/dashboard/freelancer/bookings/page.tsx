'use server';

import {getUserInfo} from '@/hooks/shared/get-user-info';
import {getMyBookings} from '@/hooks/shared/get-my-bookings';
import type {BookedServiceType} from '@/types/bookings';
import {FreelancerBookedServiceCard} from '@/components/freelancer/booked-service-card';

async function Page() {
  const user = await getUserInfo();

  if (!user) {
    return null;
  }

  const services: BookedServiceType[] = await getMyBookings({user, role: 'FREELANCER'});

  return (
    <section className="w-full max-w-6xl">
      <header className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Séances Réservées par vos Élèves</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Séances de cours réservées et actuellement en cours
        </p>
      </header>

      {services.length === 0 ? (
        <div className="flex flex-col items-start border border-border rounded-xl p-6">
          <p className="text-sm font-medium text-foreground">Aucune séance réservée pour le moment</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Lorsqu’un élève réserve l’un de vos cours, il apparaîtra ici avec ses détails.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {services.length} séance{services.length > 1 ? 's' : ''} active{services.length > 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map(service => (
              <FreelancerBookedServiceCard key={service.id} service={service} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default Page;
