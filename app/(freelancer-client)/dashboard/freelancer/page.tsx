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

export default async function Page() {
  const {userId: fId, role} = await getUserInfo();
  if (role !== 'SELLER' || !fId) return;
  const totalRevenue = await getRevenue(fId);
  const pendingBookings = await getPendingBookings(fId);
  const currentClientStory = await getCurrentClientStats(fId);
  const services: ServiceNavLite[] = (await getMyServicesLite()) || [];

  return (
    <>
      <SectionCards
        totalRevenue={totalRevenue}
        pendingClients={pendingBookings}
        currentClientStory={currentClientStory}
      />
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <FreelancerCalendar fId={fId} />
        <ServiceNav services={services} />
      </div>
    </>
  );
}
