import React from 'react';

function ServiceCardComponentSkeleton() {
  return (
    <div
      className="
    group w-full overflow-hidden rounded-xl border border-gray-200
    bg-card shadow-sm transition-all duration-300
    hover:shadow-md hover:border-gray-300
  "
    >
      {/* IMAGE SKELETON */}
      <div className="relative h-48 sm:h-40 w-full overflow-hidden bg-gray-100 animate-pulse" />

      {/* CONTENT */}
      <div className="flex flex-col justify-around h-auto p-3 space-y-3">
        {/* SELLER */}
        <header className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
        </header>

        {/* TITLE */}
        <div className="space-y-1">
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* BOTTOM BAR */}
        <div className="flex items-center justify-between text-xs">
          <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default ServiceCardComponentSkeleton;
