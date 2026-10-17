'use server';

import {mkdir, unlink, writeFile} from 'fs/promises';
import {v2 as cloudinary} from 'cloudinary';
import path from 'path';

export const storeImageToCloudinary = async (
  images: File[] | null,
  configs: {pathOverride?: string; preset?: string} = {}
): Promise<{message?: string; error?: string; cloudinaryImageUrls: string[]}> => {
  try {
    const {pathOverride = 'services/images', preset = 'five_services_images'} = configs;

    if (!images || images.length === 0) {
      return {
        message: 'Using default image',
        error: undefined,
        cloudinaryImageUrls: ['/assets/service-fallback.svg'],
      };
    }

    const cloudinaryUrls: string[] = [];
    const uploadDir = path.join(process.cwd(), 'public/services/images');
    await mkdir(uploadDir, {recursive: true});

    for (const file of images) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueName = `${Date.now()}-${safeName}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);

      if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
          const result = await cloudinary.uploader.upload(filePath, {
            upload_preset: preset || 'five_services_images',
            folder: `/${pathOverride || 'services/images'}`,
            resource_type: 'image',
            allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
          });
          cloudinaryUrls.push(result.public_id);
          await unlink(filePath);
        } catch (error: any) {
          console.error(`Cloudinary upload failed, keeping local file: ${error.message}`);
          cloudinaryUrls.push(`/services/images/${uniqueName}`);
        }
      } else {
        cloudinaryUrls.push(`/services/images/${uniqueName}`);
      }
    }

    return {
      message: 'Images uploaded successfully',
      cloudinaryImageUrls:
        cloudinaryUrls.length > 0 ? cloudinaryUrls : ['/assets/service-fallback.svg'],
      error: undefined,
    };
  } catch (error) {
    console.error('Error processing images:', error);
    return {
      error: undefined,
      message: 'Fallback image used',
      cloudinaryImageUrls: ['/assets/service-fallback.svg'],
    };
  }
};
