'use server';

import type {FAQ} from '@/types/service';
import {prisma} from '../../lib/prisma';
import {generateSlug} from '../use-slug';
import {revalidatePath} from 'next/cache';

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

function formatProfessionalTitle(rawTitle: string, categorySlug?: string | null): string {
  const cleaned = rawTitle.trim().replace(/\s+/g, ' ');
  const words = cleaned.split(' ').filter(Boolean);
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  if (words.length < 4 || capitalized.length < 22) {
    const subjectLabel = categorySlug
      ? categorySlug.replace(/-/g, ' ').toUpperCase()
      : 'Accompagnement Scolaire & Universitaire';
    return `Cours particuliers : ${capitalized} — Suivi 1-on-1 & Préparation Examens (${subjectLabel})`;
  }
  return capitalized;
}

function formatStructuredDescription(rawDesc: string, title: string): string {
  const plain = rawDesc.replace(/<[^>]*>/g, '').trim();
  if (rawDesc.includes('<h3>') && plain.length >= 100) {
    return rawDesc;
  }

  return `
    <h3>🎯 Objectifs pédagogiques du cours</h3>
    <p>${plain || `Accompagnement personnalisé et structuré autour de : ${title}.`}</p>
    <h3>📚 Déroulement d'une séance sur 9arrini</h3>
    <ul>
      <li><strong>Diagnostic & Rappel de cours :</strong> Explication claire des concepts clés et méthodes essentielles.</li>
      <li><strong>Pratique intensive :</strong> Résolution guidée de séries d'exercices et d'anciens sujets de devoirs/examens.</li>
      <li><strong>Supports inclus :</strong> Fiches de révision PDF, exercices corrigés et suivi personnalisé des progrès.</li>
    </ul>
    <h3>✅ Engagement Qualité 9arrini</h3>
    <p>Séances interactives en direct, adaptées au rythme et au niveau de chaque élève, payables directement via votre Portefeuille Points (1 Point = 1 DT).</p>
  `.trim();
}

export const storeService = async (
  service: any,
  cloudinaryImageUrls: string[]
): Promise<{message?: string; error?: string; success: boolean; serviceSlug?: string}> => {
  try {
    const rawTitle = (service.title || '').trim();
    const words = rawTitle.split(/\s+/).filter(Boolean);
    if (words.length < 3 || rawTitle.length < 12) {
      return {
        success: false,
        error:
          'Titre trop court ou non conforme : veuillez rédiger un titre complet décrivant la matière et le niveau (au moins 4 mots).',
      };
    }

    const formattedTitle = formatProfessionalTitle(rawTitle, service.categorySlug);
    const formattedDescription = formatStructuredDescription(
      service.description || '',
      formattedTitle
    );

    const catSlug = service.categorySlug || 'mathematics';
    const fallbackImg = CATEGORY_DEFAULT_IMAGES[catSlug] || '/assets/tutoring-academy.jpg';
    const validImages =
      Array.isArray(cloudinaryImageUrls) &&
      cloudinaryImageUrls.length > 0 &&
      !cloudinaryImageUrls.every(u => u.includes('service-fallback.svg'))
        ? cloudinaryImageUrls
        : [fallbackImg];

    const defaultPkgDescriptions: Record<string, string> = {
      BASIC:
        '1 séance de cours particulier 1-on-1 (60 min) + explication du chapitre + série d’exercices PDF',
      STANDARD:
        'Pack 3 séances de cours particuliers + correction de devoirs + fiches résumé de révision',
      PREMIUM:
        'Pack intensif 6 séances (Préparation Examen / Bac) + suivi complet + Q&A illimité avec le professeur',
    };

    const defaultFaqs =
      Array.isArray(service.faqs) && service.faqs.length > 0
        ? service.faqs
        : [
            {
              id: `faq-default-1-${Date.now()}`,
              question: 'Comment se déroule la séance de cours sur 9arrini ?',
              answer:
                'Chaque séance se fait en direct 1-on-1 avec explication du cours, exercices d’application et remise d’un support PDF récapitulatif.',
            },
            {
              id: `faq-default-2-${Date.now()}`,
              question: 'Comment régler la séance avec mes Points 9arrini ?',
              answer:
                '1 Point = 1 Dinar (DT). Il vous suffit de recharger votre Portefeuille Points depuis votre espace élève et de réserver en 1 clic.',
            },
          ];

    const data = await prisma.service.create({
      data: {
        title: formattedTitle,
        slug: service.slug,
        description: formattedDescription,
        images: validImages,
        status: service.status || 'ACTIVE',

        faqs: {
          create: defaultFaqs.map((faq: FAQ) => ({
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
            price: Math.max(10, Number(pkg.price) || 25),
            delivery: Math.max(1, Number(pkg.delivery) || 2),
            revisions: Math.max(1, Number(pkg.revisions) || 2),
            description:
              pkg.description && pkg.description.trim().length >= 15
                ? pkg.description.trim()
                : defaultPkgDescriptions[pkg.name] || defaultPkgDescriptions.BASIC,
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

    revalidatePath('/explore');
    revalidatePath('/');
    revalidatePath('/dashboard/freelancer/manage');
    revalidatePath('/admin');

    return {
      message: 'Votre cours a été formaté et publié avec succès !',
      success: true,
      error: undefined,
      serviceSlug: data?.slug,
    };
  } catch (error) {
    console.error('Error storing service data:', error);
    return {error: 'Error storing service data', message: undefined, success: false};
  }
};
