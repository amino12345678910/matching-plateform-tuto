'use server';

import type {User} from '@/generated/prisma';
import {auth} from '@/lib/auth';
import {headers} from 'next/headers';

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

    const {id, name, role, email, image, createdAt, emailVerified, hasPassword, imageSource} =
      session?.user || {};
    const userId = id;

    return {
      userId,
      name,
      role,
      email,
      image,
      createdAt,
      emailVerified,
      hasPassword,
      imageSource: imageSource ?? 'NULL',
    };
  } catch {
    return {
      imageSource: 'NULL',
    };
  }
}
