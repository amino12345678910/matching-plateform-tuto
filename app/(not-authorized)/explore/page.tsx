import ServiceCards from '@/components/service/card-client';
import {prisma} from '@/lib/prisma';
import NoServicesFound from '@/components/service/service-non-found';
import {getUserInfo} from '@/hooks/get-user-info';
import Navbar from '@/components/essentials/Navbar';
import {Footer} from '@/components/footer/footer';
import {GigCard} from '@/component2/components/GigCard';

export default async function ExplorePage() {
  const {userId} = await getUserInfo();

  const services = await prisma.service.findMany({
    where: {
      status: 'ACTIVE',

      bookings: {
        every: {
          NOT: {
            clientId: userId,
          },
        },
      },
    },
    include: {
      packages: true,
      seller: {select: {profilePhoto: true, user: {select: {name: true, id: true}}}},
      tags: true,
      category: true,

      _count: {select: {reviews: true, bookings: true}},
    },
    orderBy: {updatedAt: 'desc'},
  });

  const formattedServices = services.map(s => ({
    ...s,
    seller: {
      ...s.seller,
      profilePhoto: s.seller.profilePhoto ?? undefined,
    },
  }));
  return (
    <div className="container md:max-w-7xl mx-auto py-12 pt-8 px-6">
      <Navbar />
      <h3 className="text-lg font-semibold mb-10">Explore Services</h3>

      <main className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {formattedServices && formattedServices.length > 0 ? (
          <ServiceCards services={formattedServices} />
        ) : (
          <NoServicesFound />
        )}
      </main>
      <Footer />
    </div>
  );
}
