// There is no use of any Cloudinary Configuration as it had only been used for image uploading

export const data = {
  serviceImageURL: 'https://res.cloudinary.com/dxesd57dd/image/upload/',
};

export const cloudinaryUrl = (publicId: string, options?: string) => {
  return `https://res.cloudinary.com/dxesd57dd/image/upload/${options ?? ''}/${publicId}`;
};
