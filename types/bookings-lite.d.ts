export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type ServicePackageTier = 'BASIC' | 'STANDARD' | 'PREMIUM';
export type BookingLite = {
  id: string;
  servicePackageTier: ServicePackageTier;
  status: BookingStatus;
  hasSeen?: Date;
  seller: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
  service: {
    title: string;
    slug: string;
    packages: {name: string; delivery: number; revisions: number; price: number}[];
  };
  createdAt: Date;
};
