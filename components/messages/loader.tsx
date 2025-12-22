import {Skeleton, SkeletonAvatar, SkeletonLine} from '@/components/loading-primitives';

export default function MessagesLoading() {
  return (
    <div className="flex h-[80vh] border rounded-xl overflow-hidden">
      <aside className="w-64 border-r p-3 space-y-3">
        <SkeletonLine width="w-full max-w-24" height="h-4" />
        {Array.from({length: 6}).map((_, i) => (
          <div key={i} className="flex gap-3 items-start p-2">
            <SkeletonAvatar size={36} />
            <div className="space-y-1 flex-1">
              <SkeletonLine width="w-full max-w-3/4" height="h-3" />
              <SkeletonLine width="w-full" height="h-2" />
            </div>
          </div>
        ))}
      </aside>

      <section className="flex flex-col flex-1">
        <div className="border-b px-4 py-3 flex items-center gap-3">
          <SkeletonAvatar size={32} />
          <SkeletonLine width="w-full max-w-32" height="h-4" />
        </div>

        <div className="flex-1 overflow-hidden p-4 space-y-3">
          <Skeleton className="h-9 w-full max-w-[60%] rounded-lg" />
          <Skeleton className="h-9 w-full max-w-[50%] rounded-lg" />

          <Skeleton className="h-9 w-[55%] ml-auto rounded-lg" />
          <Skeleton className="h-9 w-[45%] ml-auto rounded-lg" />

          <Skeleton className="h-9 w-full max-w-[65%] rounded-lg" />
        </div>

        <div className="border-t p-3 flex gap-2">
          <SkeletonLine height="h-10" />
          <Skeleton className="h-10 w-full max-w-20 rounded-md" />
        </div>
      </section>
    </div>
  );
}
