import {unlink, writeFile} from 'fs/promises';
import {NextResponse} from 'next/server';
import path from 'path';
import {v2 as cloudinary} from 'cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const images = formData
      .getAll('images')
      .filter((entry): entry is File => entry instanceof File);

    if (!images || images.length === 0) {
      return NextResponse.json({error: 'No images uploaded'}, {status: 400});
    }

    for (const file of images) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), 'public/services/images');
      const uniqueName = `${file.name}-${Date.now()}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);

      // console.log(`Saved file to ${filePath}`);
      await cloudinary.uploader
        .upload(filePath, {
          upload_preset: 'five_services_images',
          folder: '/public/services/images',
          resource_type: 'image',
        })
        .then(result => {
          console.log('Cloudinary upload result:', result);
        })
        .catch(error => {
          console.error(`Cloudinary upload failed: ${error.message}`);
        });

      await unlink(filePath);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Images uploaded successfully',
        count: images.length,
      },
      {status: 200}
    );
  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json({error: 'Error processing images'}, {status: 500});
  }
}
