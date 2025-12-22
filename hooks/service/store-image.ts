'use server';

import {unlink, writeFile} from 'fs/promises';
import {v2 as cloudinary} from 'cloudinary';
import path from 'path';

export const storeImageToCloudinary = async (
  images: File[] | null,
  configs: {pathOverride?: string; preset?: string} = {}
): Promise<{message?: string; error?: string; cloudinaryImageUrls: string[]}> => {
  try {
    const {pathOverride = 'services/images', preset = 'five_services_images'} = configs;

    if (!images || images.length === 0) {
      return {error: 'No images uploaded', message: undefined, cloudinaryImageUrls: []};
    }

    let cloudinaryUrls: string[] = [];

    for (const file of images) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), 'public/services/images');
      const uniqueName = `${file.name}-${new Date().getTime().toString().at(-4)}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);

      // console.log(`Saved file to ${filePath}`);
      await cloudinary.uploader
        .upload(filePath, {
          upload_preset: preset || 'five_services_images',
          folder: `/${pathOverride || 'services/images'}`,
          resource_type: 'image',
          allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        })
        .then(result => {
          cloudinaryUrls.push(result.public_id);
          // console.log('Cloudinary upload result:', result);
        })
        .catch(error => {
          console.error(`Cloudinary upload failed: ${error.message}`);
        });

      await unlink(filePath);
    }

    return {
      message: 'Images uploaded successfully',
      cloudinaryImageUrls: cloudinaryUrls ?? [],
      error: undefined,
    };
  } catch (error) {
    console.error('Error processing images:', error);
    return {error: 'Error processing images', message: undefined, cloudinaryImageUrls: []};
  }
};
