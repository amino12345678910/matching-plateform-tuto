'use server';

import type {FAQ} from '@/types/service';
import {prisma} from '../../lib/prisma';
import {generateSlug} from '../use-slug';

export const storeService = async (
  service: any,
  cloudinaryImageUrls: string[]
): Promise<{message?: string; error?: string; success: boolean; serviceSlug?: string}> => {
  try {
    const data = await prisma.service.create({
      data: {
        // freelancerId: '',/
        title: service.title,
        slug: service.slug,
        description: service.description,
        images: cloudinaryImageUrls,
        status: service.status || 'PAUSED',

        faqs: {
          connectOrCreate: service.faqs.map((faq: FAQ) => {
            const {id, answer, question} = faq;
            return {
              where: {id},
              create: {question, answer},
            };
          }),
        },

        tags: {
          connectOrCreate: service.tags.map((tag: string) => {
            const slug = generateSlug(tag.toLowerCase(), {lowercase: true, randNum: false});
            return {
              where: {slug},
              create: {name: slug, slug},
            };
          }),
        },

        category: {
          connectOrCreate: {
            where: {slug: service.categorySlug},
            create: {slug: service.categorySlug, name: service.categorySlug},
          },
        },
        packages: {
          create: service.packages.map((pkg: any) => ({
            name: pkg.name,
            price: pkg.price,
            delivery: pkg.delivery,
            revisions: pkg.revisions,
            description: pkg.description,
          })),
        },
        // faqs: {
        //   connectOrCreate: service.faqs.map((faq: any) => ({
        //     where: {

        //       // question_sellerId: {
        //       //   question: faq.question,
        //       //   sellerId: service.sellerId,
        //       // },
        //     },
        //   })),
        // },

        freelancer: {connect: {id: service.sellerId}},
        seller: {connect: {userId: service.sellerId}},
      },
    });

    return {
      message: 'Service data stored successfully',
      success: true,
      error: undefined,
      serviceSlug: data?.slug,
    };
  } catch (error) {
    console.error('Error storing service data:', error);
    return {error: 'Error storing service data', message: undefined, success: false};
  }
};
