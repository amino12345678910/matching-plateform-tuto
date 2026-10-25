'use server';

import type {User} from '@/generated/prisma';
import {auth} from '@/lib/auth';
import {headers} from 'next/headers';
import {getCloudSessionCookie} from '@/hooks/auth/cloud-auth';

export type UserWithUserId = Omit<User, 'id' | 'imageSource'> & {
  userId: string;
  role: string | 'SELLER' | 'USER' | 'ADMIN';
  imageSource: string | 'NULL' | 'GOOGLE' | 'CLOUDINARY';
};
export type UserInfo = Pick<
  Partial<UserWithUserId>,
  | 'userId'
  | 'name'
  | 'role'
  | 'email'
  | 'image'
  | 'createdAt'
  | 'emailVerified'
  | 'hasPassword'
  | 'imageSource'
>;
export async function getUserInfo(): Promise<UserInfo> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.id) {
      const {id, name, role, email, image, createdAt, emailVerified, hasPassword, imageSource} =
        session.user;
      return {
        userId: id,
        name,
        role: role === 'FREELANCER' ? 'SELLER' : role,
        email,
        image,
        createdAt,
        emailVerified,
        hasPassword,
        imageSource: imageSource ?? 'NULL',
      };
    }
  } catch {
    // Fallback to cloud session cookie when local DB is not running
  }

  const cloudSession = await getCloudSessionCookie();
  if (cloudSession?.userId) {
    return {
      userId: cloudSession.userId,
      name: cloudSession.name,
      role: cloudSession.role === 'FREELANCER' ? 'SELLER' : cloudSession.role,
      email: cloudSession.email,
      image: cloudSession.image ?? null,
      createdAt: cloudSession.createdAt ? new Date(cloudSession.createdAt) : new Date(),
      emailVerified: cloudSession.emailVerified,
      hasPassword: cloudSession.hasPassword,
      imageSource: cloudSession.imageSource ?? 'NULL',
    };
  }

  return {
    imageSource: 'NULL',
  };
}
