'use server';

import {v2 as cloudinary} from 'cloudinary';

const allowed_formats = [
  'pdf',
  'doc',
  'docx',
  'txt',
  'zip',
  'rar',
  'jpg',
  'png',
  'jpeg',
  'gif',
  'webp',
  'mp4',
  'mp3',
  'mkv',
];

export const storeFilesToCloudinary = async (
  files: File[] | null,
  configs: {pathOverride?: string; preset?: string} = {}
): Promise<{cloudinaryFileUrls: string[]; message?: string; error?: string}> => {
  try {
    if (!files || files.length === 0) {
      return {error: 'No files uploaded', cloudinaryFileUrls: []};
    }

    const {pathOverride = 'services/files', preset = 'five_services_files'} = configs;

    const uploads = files.map(async file => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            upload_preset: preset,
            folder: pathOverride,
            resource_type: 'auto',
            allowed_formats,
          },
          (error, result) => {
            if (error || !result) {
              return reject(error ?? new Error('Upload failed'));
            }
            resolve(result.secure_url);
          }
        );

        stream.end(buffer);
      });
    });

    const cloudinaryFileUrls = await Promise.all(uploads);

    return {
      message: 'Files uploaded successfully',
      cloudinaryFileUrls,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      error: 'Error uploading files',
      cloudinaryFileUrls: [],
    };
  }
};
