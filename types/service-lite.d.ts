import type {BookingStatus} from './bookings';
import type {ServicePackageTier} from './service';

export type ServiceCardLite = {
  id: string;
  title: string;
  slug: string;
  images: string[];
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'REJECTED';
  packages: {
    name: 'BASIC' | 'STANDARD' | 'PREMIUM';
    delivery: number;
    price: number;
  }[];
  bookings: {
    id: string;
    clientId: string;
    freelancerId: string;
    serviceId: string;
    servicePackageTier: 'BASIC' | 'STANDARD' | 'PREMIUM';
    status: BookingStatus;
    hasSeen?: Date;
    revisions: number;
    delivery: number;
    createdAt: Date;
    updatedAt: Date;
    client: {
      name: string;
      email: string;
      image?: string;
      imageSource: string;
    };

    service: {
      packages: {name: ServicePackageTier; delivery: number; price: number; revisions}[];
      slug: string;
      title: string;
    };
  }[];
  // seller: {
  //   profilePhoto?: string;
  //   user: {
  //     id: string;
  //     name: string;
  //   };
  // };
  _count: {bookings: number};
  updatedAt: Date;
};
