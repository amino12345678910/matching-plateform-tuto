import {Skeleton} from '../ui/skeleton';

export function ServiceCardSkeleton() {
  return (
    <div className="group relative overflow-hidden transition-all duration-300 h-full border rounded-lg">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Skeleton className="absolute inset-0" />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-end">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="p-4 pt-3 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
