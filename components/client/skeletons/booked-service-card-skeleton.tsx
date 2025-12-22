import {Skeleton, SkeletonLine} from '@/components/ui/skeleton';

export function BookedServiceCardSkeleton() {
  return (
    <div
      className="
        grid grid-cols-[160px_1fr]
        border border-border
        bg-background
      "
    >
      {/* IMAGE */}
      <Skeleton className="min-h-[160px]" />

      {/* CONTENT */}
      <div className="flex flex-col justify-between p-4">
        {/* TOP */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <SkeletonLine width="w-36" height="h-3" />
            <SkeletonLine width="w-20" height="h-3" />
          </div>

          <div className="space-y-2">
            <SkeletonLine />
            {/* <SkeletonLine width="w-3/4" /> */}
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <SkeletonLine width="w-30" height="h-3" />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between pt-3 border-t border-border">
          <SkeletonLine width="w-24" height="h-3" />
          <SkeletonLine width="w-20" height="h-4" />
        </div>
      </div>
    </div>
  );
}
