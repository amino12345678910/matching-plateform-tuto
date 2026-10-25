'use server';

import {prisma} from '@/lib/prisma';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
import {revalidatePath} from 'next/cache';

export async function getTutorVerificationData() {
  const {userId, name, email} = await getUserInfo();
  if (!userId) return null;

  try {
    const seller = await prisma.seller.findUnique({
      where: {userId},
      include: {
        user: {
          select: {name: true, email: true, points: true},
        },
      },
    });
    if (seller) return seller;
  } catch {
    // Cloud fallback
  }

  const store = readCloudStore();
  let cloudSeller = store.sellers.find(s => s.userId === userId);
  const cloudUser = store.users.find(u => u.id === userId);

  if (!cloudSeller) {
    cloudSeller = {
      id: `seller_${userId}`,
      userId,
      bio: `Professeur ${name || ''} sur 9arrini`,
      isVerified: false,
      verificationStatus: 'UNVERIFIED',
      createdAt: new Date().toISOString(),
    };
    store.sellers.unshift(cloudSeller);
    writeCloudStore(store);
  }

  return {
    ...cloudSeller,
    profilePhoto: cloudSeller.profilePhoto || null,
    imageSource: 'NULL' as const,
    specialty: cloudSeller.specialty || null,
    experience: cloudSeller.experience || null,
    credentials: cloudSeller.credentials || null,
    phone: cloudSeller.phone || null,
    createdAt: new Date(cloudSeller.createdAt),
    updatedAt: new Date(cloudSeller.createdAt),
    user: {
      name: cloudUser?.name || name || 'Professeur 9arrini',
      email: cloudUser?.email || email || '',
      points: cloudUser?.points ?? 120,
    },
  };
}

export async function submitTutorVerification(data: {
  specialty: string;
  experience: string;
  credentials: string;
  phone: string;
  bio: string;
}) {
  const {userId} = await getUserInfo();
  if (!userId) {
    return {success: false, error: 'Veuillez vous connecter.'};
  }

  if (!data.specialty.trim() || !data.credentials.trim() || !data.bio.trim()) {
    return {
      success: false,
      error: 'Veuillez remplir votre spécialité, vos diplômes/références et votre biographie.',
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
        bio: data.bio.trim(),
        verificationStatus: 'PENDING',
      },
      create: {
        userId,
        specialty: data.specialty.trim(),
        experience: data.experience.trim(),
        credentials: data.credentials.trim(),
        phone: data.phone.trim(),
        bio: data.bio.trim(),
        isVerified: false,
        verificationStatus: 'PENDING',
      },
    });
  } catch {
    // Cloud fallback
  }

  const store = readCloudStore();
  let cloudSeller = store.sellers.find(s => s.userId === userId);
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
      createdAt: new Date().toISOString(),
    };
    store.sellers.unshift(cloudSeller);
  } else {
    cloudSeller.specialty = data.specialty.trim();
    cloudSeller.experience = data.experience.trim();
    cloudSeller.credentials = data.credentials.trim();
    cloudSeller.phone = data.phone.trim();
    cloudSeller.bio = data.bio.trim();
    cloudSeller.verificationStatus = 'PENDING';
  }
  writeCloudStore(store);

  revalidatePath('/dashboard/freelancer');
  revalidatePath('/dashboard/profile');
  revalidatePath('/admin');

  return {
    success: true,
    seller: cloudSeller,
    message:
      'Demande envoyée ! Votre dossier est en cours de confirmation par l’administration 9arrini.',
  };
}
