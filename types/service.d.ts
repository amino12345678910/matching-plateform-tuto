// import type {User} from 'better-auth';

import type {User} from '@/generated/prisma';

export type Seller = {
  id: string;
  bio?: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'image' | 'email'>;

  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ServicePackage = {
  id: string;
  serviceId: string;
  name: ServicePackageTier;
  price: number;
  delivery: number;
  revisions: number;
  description: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Review = {
  id: string;
  rating: number; // 1–5
  comment?: string | null;

  userId: string;
  serviceId: string;
  user: Pick<User, 'id' | 'name' | 'image'>;

  updatedAt: Date;
  createdAt: Date;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  isApproved: boolean;
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'IN_REVIEW'
  | 'DISPUTED';
export type ServicePackageTier = 'BASIC' | 'STANDARD' | 'PREMIUM';
export type Booking = {
  id: string;
  serviceId: string;
  clientId: string;
  freelancerId: string;
  servicePackageTier: ServicePackageTier;
  status: BookingStatus;
  hasSeen?: Date;
  revisedCount: number;
  revisions: number;
  delivery: number;
  client?: User;
  freelancer?: User;
  seller: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
  service: ServiceCard;
  createdAt: Date;
  updatedAt: Date;
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];

  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;

  freelancerId: string;
  sellerId: string;
  seller: Seller;

  bookings: {
    hasSeen: Date | null;
    createdAt: Date;
  }[];

  categoryId: string;
  category: Category;

  packages: ServicePackage[];
  tags: Tag[];
  faqs: FAQ[];

  reviews: Review[];
};

export type ServiceRating = {
  average: number;
  count: number;
};

export type ServiceForm = {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string;

  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;

  sellerId: string;
  seller: Seller;

  categoryId: string;
  category: Category;

  basicPackage: {
    price: number;
    delivery: number;
    revisions: number;
    description: string;
  };
  standardPackage: {
    price: number;
    delivery: number;
    revisions: number;
    description: string;
  };
  premiumPackage: {
    price: number;
    delivery: number;
    revisions: number;
    description: string;
  };
  packages: ServicePackage[];
  tags: Tag[];

  reviews: Review[];
};

export type detailedServiceProps = {
  service: Service[];
};

export type ServiceCard = {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];

  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'REJECTED';

  _count: {
    reviews: number;
    bookings: number;
  };

  sellerId: string;
  seller: {
    profilePhoto?: string;
    user: {
      id: string;
      name: string;
    };
  };

  categoryId?: string;
  category?: Category;
  packages: ServicePackage[];
  tags?: Tag[];
  bookings?: Booking[];
  createdAt: Date;
  updatedAt: Date;
};
