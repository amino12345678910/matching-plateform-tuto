import ServiceCardsSkeleton from '@/components/service/card-client-skeleton';
import Navbar from '@/components/essentials/Navbar';

export default function Loading() {
  return (
    <div className="container md:max-w-7xl mx-auto py-12 pt-8 px-6">
      <Navbar />
      <h3 className="text-lg font-semibold mb-10">Explore Services</h3>

      <main className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <ServiceCardsSkeleton count={8} />
      </main>
    </div>
  );
}
