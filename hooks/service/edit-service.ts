'use server';

import {prisma} from '../../lib/prisma';
import {generateSlug} from '../use-slug';

export const editService = async (
  service: any,
  cloudinaryImageUrls: string[]
): Promise<{
  message?: string;
  error?: string;
  success: boolean;
}> => {
  try {
    const {
      id,
      categorySlug,
      tags,
      title,
      description,
      status,
      slug,
      basicPackage,
      standardPackage,
      premiumPackage,
    } = service;

    // console.log('servier in lib ', service);
    const unSluggedTag = (tag: string) => {
      return tag.replace('-false', '').replace(/-/g, ' ');
    };

    const result = await prisma.service.update({
      where: {id: id},
      data: {
        title,
        slug,
        description,
        images: cloudinaryImageUrls,
        status: status || 'ACTIVE',

        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: {slug: tag},
            create: {slug: tag, name: unSluggedTag(tag)},
          })),
        },

        category: {
          connect: {slug: categorySlug},
        },

        packages: {
          upsert: [
            {
              where: {serviceId_name: {serviceId: id, name: 'BASIC'}},
              update: basicPackage,
              create: {name: 'BASIC', ...basicPackage},
            },
            {
              where: {serviceId_name: {serviceId: id, name: 'STANDARD'}},
              update: standardPackage,
              create: {name: 'STANDARD', ...standardPackage},
            },
            {
              where: {serviceId_name: {serviceId: id, name: 'PREMIUM'}},
              update: premiumPackage,
              create: {name: 'PREMIUM', ...premiumPackage},
            },
          ],
        },
      },
    });

    // console.log('Result: ', result);

    return {
      message: 'Service updated successfully',
      success: true,
    };
  } catch (error) {
    console.error('Error storing service data:', error);
    return {
      error: 'Error updating service',
      success: false,
    };
  }
};
