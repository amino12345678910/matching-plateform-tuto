'use server';

import {getUserInfo} from '@/hooks/shared/get-user-info';
import {getMyBookings} from '@/hooks/shared/get-my-bookings';
import type {BookedServiceType} from '@/types/bookings';
import {BookedServiceCardComponent} from '@/components/client/booked-service-card';
import Link from 'next/link';

async function Page() {
  const user = await getUserInfo();

  if (!user) {
    return null;
  }

  const services: BookedServiceType[] = await getMyBookings({user});

  return (
    <section className="w-full max-w-6xl space-y-6">
      <header className="rounded-2xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 p-5">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Mes Séances Réservées &amp; Évaluations Professeurs
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Retrouvez vos liens Google Meet ci-dessous.{' '}
          <strong className="text-emerald-800 dark:text-emerald-300">
            Important : Après chaque séance, cliquez sur « Confirmer &amp; Noter le Professeur »
          </strong>{' '}
          pour valider la tenue du cours et débloquer le paiement du professeur (ou signaler une
          absence).
        </p>
      </header>

      {services.length === 0 ? (
        <div className="flex flex-col items-start rounded-2xl border border-border p-6 bg-card">
          <p className="text-sm font-semibold text-foreground">Aucune séance réservée pour le moment</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Profitez de la semaine de lancement gratuite (0 DT) pour réserver votre première séance
            avec un professeur vérifié.
          </p>
          <Link
            href="/explore"
            className="mt-4 inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
          >
            Explorer les cours disponibles
          </Link>
        </div>
      ) : (
        <>
          <div className="text-sm font-medium text-muted-foreground">
            {services.length} séance{services.length > 1 ? 's' : ''} réservée
            {services.length > 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
