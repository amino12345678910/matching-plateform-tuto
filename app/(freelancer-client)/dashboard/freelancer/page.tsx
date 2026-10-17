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

export default async function Page() {
  const {userId: fId, role} = await getUserInfo();
  if (role !== 'SELLER' || !fId) return;
  const [totalRevenue, pendingBookings, currentClientStory, services, sellerInfo] =
    await Promise.all([
      getRevenue(fId),
      getPendingBookings(fId),
      getCurrentClientStats(fId),
      getMyServicesLite(),
      getTutorVerificationData(),
    ]);

  const serviceList: ServiceNavLite[] = services || [];

  return (
    <div className="space-y-6">
      <TutorVerificationBanner seller={sellerInfo} />
      <SectionCards
        totalRevenue={totalRevenue}
        pendingClients={pendingBookings}
        currentClientStory={currentClientStory}
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <FreelancerCalendar fId={fId} />
        <ServiceNav services={serviceList} />
      </div>
    </div>
  );
}
