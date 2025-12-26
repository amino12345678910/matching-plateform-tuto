'use server';

import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {headers} from 'next/headers';

export const setPassword = async ({newPassword, userId}: {newPassword: string; userId: string}) => {
  const headerList = await headers();

  const {status} = await auth.api.setPassword({
    body: {newPassword},
    headers: headerList,
  });

  if (status === true) {
    await prisma.user.updateMany({
      where: {id: userId},
      data: {hasPassword: true},
    });
  }
  return {status};
};
