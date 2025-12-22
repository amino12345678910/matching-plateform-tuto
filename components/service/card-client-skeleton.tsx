'use client';

import ServiceCardComponentSkeleton from './card-skeleton';

export default function ServiceCardsSkeleton({count = 4}: {count?: number}) {
  return Array.from({length: count}).map((_, idx) => <ServiceCardComponentSkeleton key={idx} />);
}
