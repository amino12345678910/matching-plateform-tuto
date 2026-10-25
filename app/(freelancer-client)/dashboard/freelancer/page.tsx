import {SectionCards} from '@/components/freelancer/section-cards';
import FreelancerCalendar from '@/components/freelancer/stats-calendar';
import {getRevenue} from '@/hooks/freelancers/dashboard/get-revenue';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {getPendingBookings} from '@/hooks/freelancers/dashboard/get-pending-booking';
import {getCurrentClientStats} from '@/hooks/freelancers/dashboard/get-current-client-stats';
import {ServiceNav} from '@/components/freelancer/dashboard/service-nav';
import getMyServicesLite, {
  type ServiceNavLite,
} from '@/hooks/freelancers/dashboard/get-my-services-lite';
import {getTutorVerificationData} from '@/hooks/freelancers/verification-actions';
import {TutorVerificationBanner} from '@/components/freelancer/tutor-verification-banner';
import {Lock} from 'lucide-react';

export default async function Page() {
  const {userId: fId, role} = await getUserInfo();
  if ((role !== 'SELLER' && role !== 'FREELANCER') || !fId) return;
  const [totalRevenue, pendingBookings, currentClientStory, services, sellerInfo] =
    await Promise.all([
      getRevenue(fId),
      getPendingBookings(fId),
      getCurrentClientStats(fId),
      getMyServicesLite(),
      getTutorVerificationData(),
    ]);

  const serviceList: ServiceNavLite[] = services || [];
  const isVerifiedTutor = Boolean(sellerInfo?.isVerified);

  return (
    <div className="space-y-6">
      <TutorVerificationBanner seller={sellerInfo} />

      {!isVerifiedTutor ? (
        <div className="px-4 lg:px-6">
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 dark:bg-slate-900/30 p-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Fonctionnalités Professeur en attente de vérification
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              La publication de cours sur la page Explorer, le calendrier des séances et la réception
              des paiements élèves seront débloqués dès que votre candidature Professeur aura été
              vérifiée et approuvée par l&apos;équipe 9arrini.
            </p>
          </div>
        </div>
      ) : (
        <>
          <SectionCards
            totalRevenue={totalRevenue}
            pendingClients={pendingBookings}
            currentClientStory={currentClientStory}
          />
          <div className="flex flex-col gap-4 px-4 lg:px-6">
            <FreelancerCalendar fId={fId} />
            <ServiceNav services={serviceList} />
          </div>
        </>
      )}
    </div>
  );
}
