import {ServiceCardSkeleton} from '@/components/service/card-skeleton';

export default function LoadingManagePage() {
  return (
    <div className="container md:max-w-7xl mx-auto py-12 pt-8 px-6 animate-pulse">
      {/* PAGE TITLE */}
      <div className="h-6 w-40 rounded bg-gray-200 mb-10" />

      {/* RECENT BOOKINGS CARD */}
      <div className="w-full mb-10 border border-gray-200 rounded-lg shadow-sm bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 space-y-2">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-200" />
        </div>

        <div className="px-6 py-4 space-y-4 max-h-60 scroll-m-1 overflow-y-scroll">
          {[1, 2].map(i => (
            <div key={i} className="p-4 rounded-md border border-gray-200 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                {/* Left section */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-md bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-24 rounded bg-gray-200" />
                  </div>
                </div>

                {/* Right section */}
                <div className="text-right space-y-2">
                  <div className="h-5 w-20 rounded-full bg-gray-200" />
                  <div className="h-3 w-16 rounded bg-gray-200" />
                </div>
              </div>

              {/* Expanded content area */}
              <div className="space-y-4 mt-3">
                {/* User Section */}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200" />
                  <div className="space-y-1">
                    <div className="h-4 w-28 rounded bg-gray-200" />
                    <div className="h-3 w-40 rounded bg-gray-200" />
                  </div>
                </div>

                {/* Package Details */}
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="space-y-1 pl-3">
                    <div className="h-3 w-40 rounded bg-gray-200" />
                    <div className="h-3 w-44 rounded bg-gray-200" />
                    <div className="h-3 w-28 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES GRID SKELETON */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {Array.from({length: 8}).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
