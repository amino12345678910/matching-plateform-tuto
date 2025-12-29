import {Skeleton} from '../loading-primitives';

export function NotificationsSkeleton() {
  return (
    <div className="container mx-auto3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>

        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      <div className="space-y-3">
        {Array.from({length: 4}).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />

                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="h-4 w-14 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              <Skeleton className="h-2.5 w-2.5 rounded-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
