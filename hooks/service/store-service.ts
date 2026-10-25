'use server';

import type {FAQ} from '@/types/service';
import {prisma} from '../../lib/prisma';
import {generateSlug} from '../use-slug';
import {revalidatePath} from 'next/cache';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {
  saveCustomServiceCookie,
  getSellersRegistryCookie,
} from '@/hooks/book/bookings-store';
import {
  generateMeetCode,
  getDefaultSessionDate,
  formatScheduleLabel,
} from '@/lib/google-meet';

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  mathematics: '/assets/seo.webp',
  coding: '/assets/software-development.webp',
  languages: '/assets/voice-over.webp',
  science: '/assets/data-science.webp',
  'ai-data': '/assets/data-science.webp',
  'music-arts': '/assets/architecture-design.webp',
  business: '/assets/e-commerce.webp',
  'exam-prep': '/assets/website-development.webp',
};

function appendMeetScheduleToDescription(
  rawDesc: string,
  meetUrl: string,
  scheduledDate: string,
  scheduledTime: string
): string {
  const cleaned = (rawDesc || '').trim();
  const scheduleBanner = `
    <div data-session-date="${scheduledDate}" data-session-time="${scheduledTime}">
      <h3>📹 Séance Google Meet Planifiée</h3>
      <p><strong>Date & Heure prévues :</strong> ${formatScheduleLabel(scheduledDate, scheduledTime)} • <strong>Lien Google Meet :</strong> <a href="${meetUrl}" target="_blank" rel="noopener noreferrer">${meetUrl}</a></p>
    </div>
  `.trim();

  if (!cleaned) return scheduleBanner;
  if (cleaned.includes('<p>') || cleaned.includes('<h3>') || cleaned.includes('<ul>')) {
    return `${cleaned}\n${scheduleBanner}`;
  }
  return `<p>${cleaned}</p>\n${scheduleBanner}`;
}

export const storeService = async (
  service: any,
  cloudinaryImageUrls: string[]
): Promise<{
  message?: string;
  error?: string;
  success: boolean;
  serviceSlug?: string;
  meetLink?: string;
}> => {
  try {
    const rawTitle = (service.title || '').trim();
    if (rawTitle.length < 3) {
      return {
        success: false,
        error: 'Veuillez saisir un titre valide pour votre cours.',
      };
    }

    const formattedTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
    let createdSlug =
      service.slug || generateSlug(formattedTitle, {lowercase: true, randNum: true});

    const scheduledDate = service.scheduledDate || getDefaultSessionDate(2);
    const scheduledTime = service.scheduledTime || '18:00';
    const meetLink =
      service.meetLink && service.meetLink.startsWith('https://meet.google.com/')
        ? service.meetLink
        : `https://meet.google.com/${generateMeetCode(createdSlug)}`;

    const formattedDescription = appendMeetScheduleToDescription(
      service.description || '',
      meetLink,
      scheduledDate,
      scheduledTime
    );

    const catSlug = service.categorySlug || 'mathematics';
    const fallbackImg = CATEGORY_DEFAULT_IMAGES[catSlug] || '/assets/tutoring-academy.jpg';
    const validImages =
      Array.isArray(cloudinaryImageUrls) &&
      cloudinaryImageUrls.length > 0 &&
      !cloudinaryImageUrls.every(u => u.includes('service-fallback.svg'))
        ? cloudinaryImageUrls
        : [fallbackImg];

    const realFaqs = Array.isArray(service.faqs) ? service.faqs.filter((f: any) => f.question && f.answer) : [];

    try {
      const data = await prisma.service.create({
        data: {
          title: formattedTitle,
          slug: createdSlug,
          description: formattedDescription,
          images: validImages,
          status: service.status || 'ACTIVE',
          faqs: {
            create: realFaqs.map((faq: FAQ) => ({
              question: faq.question,
              answer: faq.answer,
            })),
          },
          tags: {
            connectOrCreate: (service.tags || []).map((tag: string) => {
              const slug = generateSlug(tag.toLowerCase(), {lowercase: true, randNum: false});
              return {
                where: {slug},
                create: {name: slug, slug},
              };
            }),
          },
          category: {
            connectOrCreate: {
              where: {slug: catSlug},
              create: {slug: catSlug, name: catSlug.toUpperCase()},
            },
          },
          packages: {
            create: service.packages.map((pkg: any) => ({
              name: pkg.name,
              price: Math.max(1, Number(pkg.price) || 25),
              delivery: Math.max(1, Number(pkg.delivery) || 1),
              revisions: Math.max(1, Number(pkg.revisions) || 1),
              description: (pkg.description || '').trim() || `Pack ${pkg.name} — ${formattedTitle}`,
            })),
          },
          freelancer: {connect: {id: service.sellerId}},
          seller: {
            connectOrCreate: {
              where: {userId: service.sellerId},
              create: {userId: service.sellerId},
            },
          },
        },
      });
      createdSlug = data?.slug || createdSlug;
    } catch {
      // Cloud fallback when running on Vercel
    }

    const {name, email} = await getUserInfo();
    const store = readCloudStore();
    const cookieSellers = await getSellersRegistryCookie();
    const cookieSeller = cookieSellers.find(s => s.userId === service.sellerId);
    const cloudSeller = store.sellers.find(s => s.userId === service.sellerId) || cookieSeller;
    const isSellerVerified = Boolean(cloudSeller?.isVerified || cookieSeller?.isVerified);

    if (!isSellerVerified) {
      return {
        success: false,
        error:
          'Accès restreint : votre candidature Professeur doit d’abord être vérifiée et validée par l’administration 9arrini avant de publier un cours.',
      };
    }

    const cloudUser = store.users.find(u => u.id === service.sellerId);
    const now = new Date().toISOString();
    const serviceId = `srv_${Date.now()}`;

    const newServiceObj = {
      id: serviceId,
      slug: createdSlug,
      title: formattedTitle,
      description: formattedDescription,
      meetLink,
      scheduledDate,
      scheduledTime,
      images: validImages,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      freelancerId: service.sellerId,
      sellerId: cloudSeller?.id || `seller_${service.sellerId}`,
      categoryId: catSlug,
      category: {id: catSlug, slug: catSlug, name: catSlug.toUpperCase()},
      averageRating: 0,
      _count: {reviews: 0, bookings: 0},
      reviews: [],
      bookings: [],
      tags: (service.tags || []).map((t: string, i: number) => ({
        id: `tag_${i}`,
        name: t,
        slug: t,
        isApproved: true,
      })),
      faqs: realFaqs,
      seller: {
        id: cloudSeller?.id || `seller_${service.sellerId}`,
        userId: service.sellerId,
        isVerified: cloudSeller?.isVerified ?? false,
        verified: cloudSeller?.isVerified ?? false,
        verificationStatus: cloudSeller?.verificationStatus || 'PENDING',
        specialty: cloudSeller?.specialty,
        credentials: cloudSeller?.credentials,
        experience: cloudSeller?.experience,
        phone: cloudSeller?.phone || '',
        bio: cloudSeller?.bio || '',
        profilePhoto: undefined,
        createdAt: now,
        updatedAt: now,
        user: {
          id: service.sellerId,
          name: cloudUser?.name || name || 'Professeur 9arrini',
          email: cloudUser?.email || email || '',
          image: cloudUser?.image || null,
          imageSource: cloudUser?.imageSource || 'GOOGLE',
        },
      },
      packages: service.packages.map((pkg: any, idx: number) => ({
        id: `pkg_${Date.now()}_${idx}`,
        serviceId,
        name: pkg.name,
        price: Math.max(1, Number(pkg.price) || 25),
        delivery: Math.max(1, Number(pkg.delivery) || 1),
        revisions: Math.max(1, Number(pkg.revisions) || 1),
        description: (pkg.description || '').trim() || `Pack ${pkg.name} — ${formattedTitle}`,
      })),
    };

    store.customServices.unshift(newServiceObj);
    writeCloudStore(store);
    await saveCustomServiceCookie(newServiceObj);

    revalidatePath('/explore');
    revalidatePath('/');
    revalidatePath('/dashboard/freelancer/manage');
    revalidatePath('/admin');

    return {
      message: `Votre cours et le lien Google Meet (${meetLink}) ont été publiés avec succès !`,
      success: true,
      error: undefined,
      serviceSlug: createdSlug,
      meetLink,
    };
  } catch (error) {
    console.error('Error storing service data:', error);
    return {error: 'Error storing service data', message: undefined, success: false};
  }
};
