import fs from 'fs';
import path from 'path';
import os from 'os';
import {FALLBACK_CATEGORIES} from './fallback-data';

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
  phone?: string | null;
  city?: string | null;
  studentLevel?: string | null;
  studentGrade?: string | null;
  studentSection?: string | null;
  institution?: string | null;
  subjectsOfInterest?: string[];
  acceptedTermsAt?: string | null;
  termsVersion?: string | null;
  createdAt: string;
}

export interface CloudSeller {
  id: string;
  userId: string;
  bio: string;
  isVerified: boolean;
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  specialty?: string;
  credentials?: string;
  experience?: string;
  phone?: string;
  city?: string;
  subjects?: string[];
  levelsTaught?: string[];
  payoutMethod?: string;
  payoutAccount?: string;
  acceptedTutorTermsAt?: string;
  profilePhoto?: string;
  createdAt: string;
}

export interface CloudPointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'PURCHASE' | 'BOOKING_PAYMENT' | 'EARNING' | 'ADMIN_GRANT' | 'BONUS' | 'REFUND' | 'PAYOUT';
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
  clientLevel?: string;
  clientGrade?: string;
  freelancerId: string;
  freelancerName: string;
  sellerId: string;
  servicePackageTier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  totalPrice: number;
  originalPrice?: number;
  isFreeTrial?: boolean;
  platformFee?: number;
  tutorEarning?: number;
  payoutStatus?: 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED' | 'FREE_TRIAL';
  studentConfirmed?: boolean;
  studentRating?: number;
  studentReview?: string;
  completedAt?: string;
  releasedAt?: string;
  disputeReason?: string;
  delivery: number;
  revisions: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  scheduledDate?: string;
  scheduledTime?: string;
  meetUrl?: string;
  tutorPhone?: string;
  createdAt: string;
}

export interface CloudNotification {
  id: string;
  userId: string;
  title: string;
  type: 'ORDER' | 'MESSAGE' | 'AUTOMATED' | 'SYSTEM';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface CloudChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  recipientName?: string;
  text: string;
  createdAt: string;
}

export interface CloudReview {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  serviceId: string;
  serviceSlug?: string;
  rating: number;
  comment: string;
  quality?: number;
  communication?: number;
  behavior?: number;
  professionalism?: number;
  createdAt: string;
}

export interface CloudStoreData {
  users: CloudUser[];
  sellers: CloudSeller[];
  transactions: CloudPointTransaction[];
  bookings: CloudBooking[];
  customServices: any[];
  reviews: CloudReview[];
  notifications?: CloudNotification[];
  messages?: CloudChatMessage[];
  freeTrialActive?: boolean;
  freeTrialEndsAt?: string;
}

const STORE_FILE = path.join(os.tmpdir(), '9arrini-cloud-store-v4-clean.json');

function getInitialStore(): CloudStoreData {
  const defaultEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    users: [],
    sellers: [],
    transactions: [],
    bookings: [],
    customServices: [],
    reviews: [],
    notifications: [],
    messages: [],
    freeTrialActive: true,
    freeTrialEndsAt: defaultEndsAt,
  };
}

export function readCloudStore(): CloudStoreData {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) {
        if (!Array.isArray(parsed.reviews)) parsed.reviews = [];
        if (!Array.isArray(parsed.customServices)) parsed.customServices = [];
        if (!Array.isArray(parsed.bookings)) parsed.bookings = [];
        if (!Array.isArray(parsed.transactions)) parsed.transactions = [];
        if (!Array.isArray(parsed.notifications)) parsed.notifications = [];
        if (!Array.isArray(parsed.messages)) parsed.messages = [];
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
  const userMap = new Map(store.users.map(u => [u.id, u]));

  return (store.customServices || []).map(srv => {
    const sellerUserId = srv.seller?.userId || srv.freelancerId;
    const updatedSeller = sellerMap.get(sellerUserId);
    const updatedUser = userMap.get(sellerUserId);
    const serviceReviews = (store.reviews || []).filter(
      r => r.serviceId === srv.id || (srv.slug && r.serviceSlug === srv.slug)
    );
    const serviceBookings = (store.bookings || []).filter(
      b =>
        (b.serviceId === srv.id || (srv.slug && b.serviceSlug === srv.slug)) &&
        b.status !== 'CANCELLED'
    );
    const avgRating =
      serviceReviews.length > 0
        ? serviceReviews.reduce((acc, r) => acc + r.rating, 0) / serviceReviews.length
        : 0;

    return {
      ...srv,
      averageRating: avgRating,
      reviews: serviceReviews,
      _count: {
        reviews: serviceReviews.length,
        bookings: serviceBookings.length,
      },
      seller: {
        ...srv.seller,
        isVerified: updatedSeller ? updatedSeller.isVerified : srv.seller?.isVerified ?? false,
        verified: updatedSeller ? updatedSeller.isVerified : srv.seller?.isVerified ?? false,
        verificationStatus:
          updatedSeller?.verificationStatus || srv.seller?.verificationStatus || 'PENDING',
        specialty: updatedSeller?.specialty || srv.seller?.specialty,
        credentials: updatedSeller?.credentials || srv.seller?.credentials,
        experience: updatedSeller?.experience || srv.seller?.experience,
        phone: updatedSeller?.phone || srv.seller?.phone,
        bio: updatedSeller?.bio || srv.seller?.bio,
        user: {
          ...srv.seller?.user,
          name: updatedUser?.name || srv.seller?.user?.name || 'Professeur 9arrini',
          email: updatedUser?.email || srv.seller?.user?.email || '',
          image: updatedUser?.image ?? srv.seller?.user?.image ?? null,
          imageSource: updatedUser?.imageSource || srv.seller?.user?.imageSource || 'NULL',
        },
      },
    };
  });
}

export {FALLBACK_CATEGORIES};
