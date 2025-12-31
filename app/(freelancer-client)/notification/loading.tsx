import Navbar from '@/components/essentials/Navbar';
import {Footer} from '@/components/footer/footer-2';
import {Skeleton} from '@/components/loading-primitives';

export default function NotificationsSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-36" />
            </div>

            <Skeleton className="h-8 w-32 rounded-md" />
          </div>

          {/* Notification list */}
          <div className="space-y-3">
            {Array.from({length: 5}).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border p-4 space-y-3"
                style={{
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[85%]" />
                    <Skeleton className="h-4 w-[65%]" />

                    <div className="flex items-center gap-2 pt-1">
                      <Skeleton className="h-4 w-16 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>

                  <Skeleton className="h-2.5 w-2.5 rounded-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
