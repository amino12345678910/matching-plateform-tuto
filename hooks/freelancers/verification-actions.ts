'use server';

import {prisma} from '@/lib/prisma';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
import {getCloudSessionCookie, setCloudSessionCookie} from '@/hooks/auth/cloud-auth';
import {
  getSellersRegistryCookie,
  saveSellerRegistryCookie,
  saveClientNotificationCookie,
} from '@/hooks/book/bookings-store';
import {revalidatePath} from 'next/cache';

export async function getTutorVerificationData() {
  const {userId, name, email, image} = await getUserInfo();
  if (!userId) return null;

  try {
    const seller = await prisma.seller.findUnique({
      where: {userId},
      include: {
        user: {
          select: {name: true, email: true, points: true, image: true},
        },
      },
    });
    if (seller) return seller;
  } catch {
    // Cloud fallback
  }

  const cookieSellers = await getSellersRegistryCookie();
  const cookieSeller = cookieSellers.find(s => s.userId === userId);
  const store = readCloudStore();
  let cloudSeller = store.sellers.find(s => s.userId === userId);
  const cloudUser = store.users.find(u => u.id === userId);

  if (cookieSeller && !cloudSeller) {
    cloudSeller = cookieSeller;
    store.sellers.unshift(cookieSeller);
    writeCloudStore(store);
  } else if (cookieSeller && cloudSeller) {
    cloudSeller = {
      ...cloudSeller,
      ...cookieSeller,
      isVerified: Boolean(cloudSeller.isVerified || cookieSeller.isVerified),
      verificationStatus:
        cloudSeller.isVerified || cookieSeller.isVerified
          ? 'VERIFIED'
          : cookieSeller.verificationStatus || cloudSeller.verificationStatus,
    };
  }

  if (!cloudSeller) {
    cloudSeller = {
      id: `seller_${userId}`,
      userId,
      bio: '',
      isVerified: false,
      verificationStatus: 'UNVERIFIED',
      createdAt: new Date().toISOString(),
    };
    store.sellers.unshift(cloudSeller);
    writeCloudStore(store);
    await saveSellerRegistryCookie(cloudSeller);
  }

  return {
    ...cloudSeller,
    profilePhoto: cloudSeller.profilePhoto || cloudUser?.image || image || null,
    imageSource: 'NULL' as const,
    specialty: cloudSeller.specialty || null,
    experience: cloudSeller.experience || null,
    credentials: cloudSeller.credentials || null,
    phone: cloudSeller.phone || null,
    city: cloudSeller.city || cloudUser?.city || null,
    payoutMethod: cloudSeller.payoutMethod || 'D17',
    payoutAccount: cloudSeller.payoutAccount || null,
    createdAt: new Date(cloudSeller.createdAt),
    updatedAt: new Date(cloudSeller.createdAt),
    user: {
      name: cloudUser?.name || name || 'Professeur 9arrini',
      email: cloudUser?.email || email || '',
      points: cloudUser?.points ?? 0,
      image: cloudSeller.profilePhoto || cloudUser?.image || image || null,
    },
  };
}

export async function submitTutorVerification(data: {
  specialty: string;
  experience: string;
  credentials: string;
  phone: string;
  city?: string;
  payoutMethod?: string;
  payoutAccount?: string;
  profilePhoto?: string;
  bio: string;
}) {
  const {userId, name} = await getUserInfo();
  if (!userId) {
    return {success: false, error: 'Veuillez vous connecter.'};
  }

  if (
    !data.specialty.trim() ||
    !data.credentials.trim() ||
    !data.experience.trim() ||
    !data.phone.trim() ||
    !data.bio.trim()
  ) {
    return {
      success: false,
      error:
        'Veuillez remplir tous les champs obligatoires (spécialité, diplômes, expérience, téléphone et biographie complète).',
    };
  }

  try {
    await prisma.seller.upsert({
      where: {userId},
      update: {
        specialty: data.specialty.trim(),
        experience: data.experience.trim(),
        credentials: data.credentials.trim(),
        phone: data.phone.trim(),
        city: data.city?.trim() || null,
        payoutMethod: data.payoutMethod?.trim() || 'D17',
        payoutAccount: data.payoutAccount?.trim() || null,
        profilePhoto: data.profilePhoto?.trim() || undefined,
        bio: data.bio.trim(),
        verificationStatus: 'PENDING',
      },
      create: {
        userId,
        specialty: data.specialty.trim(),
        experience: data.experience.trim(),
        credentials: data.credentials.trim(),
        phone: data.phone.trim(),
        city: data.city?.trim() || null,
        payoutMethod: data.payoutMethod?.trim() || 'D17',
        payoutAccount: data.payoutAccount?.trim() || null,
        profilePhoto: data.profilePhoto?.trim() || undefined,
        bio: data.bio.trim(),
        isVerified: false,
        verificationStatus: 'PENDING',
      },
    });
  } catch {
    // Cloud fallback
  }

  const now = new Date().toISOString();
  const store = readCloudStore();
  let cloudSeller = store.sellers.find(s => s.userId === userId);
  const cloudUser = store.users.find(u => u.id === userId);

  if (cloudUser) {
    if (data.profilePhoto?.trim()) {
      cloudUser.image = data.profilePhoto.trim();
      cloudUser.imageSource = 'CLOUDINARY';
    }
    if (data.city?.trim()) cloudUser.city = data.city.trim();
    if (data.phone?.trim()) cloudUser.phone = data.phone.trim();
  }

  if (!cloudSeller) {
    cloudSeller = {
      id: `seller_${userId}`,
      userId,
      bio: data.bio.trim(),
      isVerified: false,
      verificationStatus: 'PENDING',
      specialty: data.specialty.trim(),
      experience: data.experience.trim(),
      credentials: data.credentials.trim(),
      phone: data.phone.trim(),
      city: data.city?.trim() || undefined,
      payoutMethod: data.payoutMethod?.trim() || 'D17',
      payoutAccount: data.payoutAccount?.trim() || undefined,
      profilePhoto: data.profilePhoto?.trim() || undefined,
      acceptedTutorTermsAt: now,
      createdAt: now,
    };
    store.sellers.unshift(cloudSeller);
  } else {
    cloudSeller.specialty = data.specialty.trim();
    cloudSeller.experience = data.experience.trim();
    cloudSeller.credentials = data.credentials.trim();
    cloudSeller.phone = data.phone.trim();
    if (data.city?.trim()) cloudSeller.city = data.city.trim();
    if (data.payoutMethod?.trim()) cloudSeller.payoutMethod = data.payoutMethod.trim();
    if (data.payoutAccount?.trim()) cloudSeller.payoutAccount = data.payoutAccount.trim();
    if (data.profilePhoto?.trim()) cloudSeller.profilePhoto = data.profilePhoto.trim();
    cloudSeller.bio = data.bio.trim();
    cloudSeller.acceptedTutorTermsAt = now;
    if (!cloudSeller.isVerified) {
      cloudSeller.verificationStatus = 'PENDING';
    }
  }
  writeCloudStore(store);
  await saveSellerRegistryCookie(cloudSeller);

  const session = await getCloudSessionCookie();
  if (session && data.profilePhoto?.trim()) {
    await setCloudSessionCookie({
      ...session,
      image: data.profilePhoto.trim(),
      imageSource: 'CLOUDINARY',
    });
  }

  await saveClientNotificationCookie({
    id: `notif_apply_${Date.now()}`,
    userId,
    title: `📋 Profil Professeur complet enregistré (${data.specialty.trim()}). Votre dossier est prêt pour validation par l'administration 9arrini.`,
    type: 'AUTOMATED',
    link: '/dashboard/freelancer',
    read: false,
    createdAt: now,
  });

  revalidatePath('/dashboard/freelancer');
  revalidatePath('/dashboard/freelancer/account');
  revalidatePath('/dashboard/freelancer/create-service');
  revalidatePath('/dashboard/profile');
  revalidatePath('/admin');

  return {
    success: true,
    seller: cloudSeller,
    message: `Merci ${name || ''} ! Votre profil complet Professeur a été enregistré et transmis à l'administration 9arrini.`,
  };
}
