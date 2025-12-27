export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';
export type ServicePackageTier = 'BASIC' | 'STANDARD' | 'PREMIUM';
export type Booking = {
  id: string;
  servicePackageTier: ServicePackageTier;
  status: BookingStatus;
  hasSeen?: Date;
  revisedCount: number;
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

export type BookedServiceType = {
  id: string;
  title: string;
  slug: string;
  images: string[];
  hasSeen?: Date;
  revisedCount?: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'REJECTED';
  packages: {
    name: 'BASIC' | 'STANDARD' | 'PREMIUM';
    delivery: number;
    price: number;
  }[];
  counterparty: {
    imageSource: 'GOOGLE' | 'CLOUDINARY' | 'NULL';
    image?: string;
    email: string;
    name: string;
    id: string;
  };
  updatedAt: Date;
};
