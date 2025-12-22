import {SkeletonLine} from '@/components/ui/skeleton';
import {BookedServiceCardSkeleton} from '@/components/client/skeletons/booked-service-card-skeleton';

function BookingsLoader() {
  return (
    <section className="w-full max-w-6xl">
      <div className="mb-8 space-y-2">
        <SkeletonLine height="h-5" width="w-full max-w-48 " />
        <SkeletonLine height="h-4" width="w-full max-w-96 mb-4" />
      </div>
      <SkeletonLine width="w-full max-w-32 mb-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({length: 4}).map((_, i) => (
          <BookedServiceCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export default BookingsLoader;
