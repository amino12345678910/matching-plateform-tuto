// There is no use of any Cloudinary Configuration as it had only been used for image uploading

export const data = {
  serviceImageURL: 'https://res.cloudinary.com/dxesd57dd/image/upload/',
};

export const cloudinaryUrl = (publicId: string, options?: string) => {
  if (!publicId) return '/assets/service-fallback.svg';
  if (
    publicId.startsWith('/') ||
    publicId.startsWith('http://') ||
    publicId.startsWith('https://') ||
    publicId.startsWith('data:')
  ) {
    return publicId;
  }
  return `https://res.cloudinary.com/dxesd57dd/image/upload/${options ?? ''}/${publicId}`;
};
