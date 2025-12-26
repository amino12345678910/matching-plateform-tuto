'use server';
import {prisma} from '@/lib/prisma';

export const updateImage = async ({imageUrl, id}: {imageUrl: string; id: string}) => {
  try {
    if (!imageUrl) return {success: false};

    await prisma.user.updateMany({
      where: {id},
      data: {image: imageUrl, imageSource: 'CLOUDINARY'},
    });

    return {success: true};
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    throw new Error(errorMessage);
  }
};
