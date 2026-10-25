import fs from 'fs';
import path from 'path';
import os from 'os';
import {FALLBACK_CATEGORIES, FALLBACK_SERVICES} from './fallback-data';

export interface CloudUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'USER' | 'FREELANCER' | 'SELLER' | 'ADMIN';
  points: number;
  image?: string | null;
  imageSource: 'NULL' | 'GOOGLE' | 'CLOUDINARY';
  hasPassword: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface CloudSeller {
  id: string;
  userId: string;
  bio: string;
  isVerified: boolean;
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  specialty?: string;
  credentials?: string;
  experience?: string;
  phone?: string;
  profilePhoto?: string;
  createdAt: string;
}

export interface CloudPointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'PURCHASE' | 'BOOKING_PAYMENT' | 'EARNING' | 'ADMIN_GRANT' | 'BONUS';
  description: string;
  createdAt: string;
}

export interface CloudBooking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceSlug: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  freelancerId: string;
  freelancerName: string;
  sellerId: string;
  servicePackageTier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  totalPrice: number;
  delivery: number;
  revisions: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface CloudStoreData {
  users: CloudUser[];
  sellers: CloudSeller[];
  transactions: CloudPointTransaction[];
  bookings: CloudBooking[];
  customServices: any[];
}

const STORE_FILE = path.join(os.tmpdir(), '9arrini-cloud-store-v1.json');

function getInitialStore(): CloudStoreData {
  const now = new Date().toISOString();
  const initialUsers: CloudUser[] = FALLBACK_SERVICES.map(s => ({
    id: s.seller.user.id,
    name: s.seller.user.name,
    email: s.seller.user.email,
    role: 'FREELANCER',
    points: 120,
    image: null,
    imageSource: 'NULL',
    hasPassword: true,
    emailVerified: true,
    createdAt: now,
  }));

  const initialSellers: CloudSeller[] = FALLBACK_SERVICES.map(s => ({
    id: s.seller.id,
    userId: s.seller.userId,
    bio: s.seller.bio || '',
    isVerified: s.seller.isVerified,
    verificationStatus: (s.seller.verificationStatus as any) || 'VERIFIED',
    specialty: s.seller.specialty,
    credentials: s.seller.credentials,
    experience: s.seller.experience,
    phone: '+216 22 410 112',
    createdAt: now,
  }));

  return {
    users: initialUsers,
    sellers: initialSellers,
    transactions: [],
    bookings: [],
    customServices: [],
  };
}

export function readCloudStore(): CloudStoreData {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cloud store:', e);
  }
  const initial = getInitialStore();
  writeCloudStore(initial);
  return initial;
}

export function writeCloudStore(data: CloudStoreData): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing cloud store:', e);
  }
}

export function getAllCloudServices() {
  const store = readCloudStore();
  const sellerMap = new Map(store.sellers.map(s => [s.userId, s]));
  const baseServices = FALLBACK_SERVICES.map(srv => {
    const updatedSeller = sellerMap.get(srv.seller.userId);
    if (updatedSeller) {
      return {
        ...srv,
        seller: {
          ...srv.seller,
          isVerified: updatedSeller.isVerified,
          verified: updatedSeller.isVerified,
          verificationStatus: updatedSeller.verificationStatus,
          specialty: updatedSeller.specialty || srv.seller.specialty,
          credentials: updatedSeller.credentials || srv.seller.credentials,
          experience: updatedSeller.experience || srv.seller.experience,
          bio: updatedSeller.bio || srv.seller.bio,
        },
      };
    }
    return srv;
  });

  return [...store.customServices, ...baseServices];
}

export {FALLBACK_CATEGORIES};
