// app/explore/loading.tsx
import Navbar from '@/components/essentials/Navbar';
import {Footer} from '@/components/footer/footer';
import {ServiceCardSkeleton} from '@/components/service/card-skeleton';
import {Skeleton} from '@/components/ui/skeleton';

export default function ExplorePageSkeleton() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section Skeleton */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto mb-8" />

            {/* Search Skeleton */}
            <div className="relative max-w-2xl mx-auto mb-6">
              <Skeleton className="h-14 w-full rounded-full" />
            </div>

            {/* Categories Skeleton */}
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({length: 7}).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        {/* Trending Services Skeleton */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="w-full pb-4 overflow-hidden">
            <div className="flex gap-4">
              {Array.from({length: 6}).map((_, i) => (
                <div key={i} className="min-w-[240px]">
                  <div className="border rounded-lg p-4 h-full">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-16 w-16 flex-shrink-0 rounded-lg" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center justify-between pt-2">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({length: 8}).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Load More Skeleton */}
        <div className="text-center mt-8">
          <Skeleton className="h-10 w-32 mx-auto" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
