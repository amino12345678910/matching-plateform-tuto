'use server';

import {prisma as dbContext} from '@/lib/prisma';
import {redirect} from 'next/navigation';
import {storeImageToCloudinary} from '../service/store-image';
import {generateSlug} from '../use-slug';
import {dataURLtoFile} from '../use-file-converter';

const createSeller = async (sellerData: {
  userId: string;
  bio?: string;
  profilePhoto?: string;
}): Promise<{success?: boolean; error?: string}> => {
  const isAlreadySeller = await dbContext.seller.findUnique({
    where: {userId: sellerData.userId, isVerified: true},
    select: {id: true},
  });

  if (isAlreadySeller) {
    redirect('/dashboard/create-service');
  }

  const seller = await dbContext.user.findUnique({
    where: {id: sellerData.userId},
    select: {name: true, id: true},
  });

  if (!(seller && seller.id)) console.error('Seller not found');

  const filename = generateSlug(
    `${seller?.name + seller?.id! + '-seller-picture'}` || 'seller-picture',
    {lowercase: true, randNum: seller?.name ? false : true}
  );

  let profilePhoto = '';
  // console.log('we are here');
  if (sellerData.profilePhoto) {
    const profilePhotoFile = dataURLtoFile(sellerData.profilePhoto, filename);
    // console.log('file converter ', profilePhotoFile);

    await storeImageToCloudinary([profilePhotoFile], {
      pathOverride: 'seller/images',
      preset: 'five_seller_images',
    })
      .then(imageUrl => {
        profilePhoto = imageUrl.cloudinaryImageUrls[0];
        console.log('Image uploaded to Cloudinary:', imageUrl.cloudinaryImageUrls);
      })
      .catch(error => {
        console.error('Error uploading image to Cloudinary:', error);
      });
  }
  // public / seller / images / cug3ihpapdxsknpxouox;

  const prismaResult = await dbContext.seller.create({
    data: {
      bio: sellerData.bio,
      userId: sellerData.userId,
      profilePhoto: profilePhoto || '',
      imageSource: 'CLOUDINARY',
    },
  });

  const userResult = await dbContext.user.update({
    where: {id: prismaResult.userId},
    data: {image: profilePhoto, imageSource: 'CLOUDINARY'},
  });

  if (userResult === null || !userResult)
    return {success: false, error: 'Failed to update user image'};

  if (prismaResult === null || !prismaResult)
    return {success: false, error: 'Failed to create seller'};

  return {success: true};
};
export default createSeller;
