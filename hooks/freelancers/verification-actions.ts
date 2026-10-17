'use server';

import {prisma} from '@/lib/prisma';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {revalidatePath} from 'next/cache';

export async function getTutorVerificationData() {
  const {userId} = await getUserInfo();
  if (!userId) return null;

  const seller = await prisma.seller.findUnique({
    where: {userId},
    include: {
      user: {
        select: {name: true, email: true, points: true},
      },
    },
  });

  return seller;
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
    const seller = await prisma.seller.upsert({
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

    await prisma.notification.create({
      data: {
        userId,
        type: 'AUTOMATED',
        title:
          'Votre demande de vérification Prof 9arrini a été envoyée aux administrateurs pour confirmation.',
        link: '/dashboard/freelancer',
      },
    });

    revalidatePath('/dashboard/freelancer');
    revalidatePath('/dashboard/profile');

    return {
      success: true,
      seller,
      message:
        'Demande envoyée ! Votre dossier est en cours de confirmation par l’administration 9arrini.',
    };
  } catch (error) {
    console.error('Error submitting tutor verification:', error);
    return {
      success: false,
      error: 'Erreur lors de la soumission du dossier de vérification.',
    };
  }
}
