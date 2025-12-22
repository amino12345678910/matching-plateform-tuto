import {generateRandNum} from '@/hooks/use-rand-nums';
import {cloudinaryUrl} from '@/lib/cloudinary';
import {thumbs} from '@dicebear/collection';
import {createAvatar} from '@dicebear/core';

type ImageSource = 'GOOGLE' | 'CLOUDINARY' | 'NULL' | null | undefined;

interface ProfilePhotoParams {
  email?: string;
  imageSource?: string | ImageSource;
  imageUrl?: string | null;
}

const generateAvatar = (seed?: string) => {
  const fallbackSeed = generateRandNum({lowercase: true});
  return createAvatar(thumbs, {
    seed: seed ?? fallbackSeed,
  }).toDataUri();
};

export const profilePhoto = async ({
  imageSource,
  imageUrl,
  email,
}: ProfilePhotoParams = {}): Promise<string> => {
  if (!imageSource || !imageUrl || imageSource === 'NULL') return generateAvatar(email);

  switch (imageSource) {
    case 'GOOGLE':
      return imageUrl;
    case 'CLOUDINARY':
      return cloudinaryUrl(imageUrl, 'q_40,f_auto');
    default:
      return generateAvatar(email);
  }
};
