'use server';

import {prisma as dbContext} from '@/lib/prisma';
import type {ServiceCard as ServiceCardType} from '@/types/service';

type updateServiceStatusProps = {
  status: ServiceCardType['status'];
  slug: ServiceCardType['slug'];
};
export const updateServiceStatus = async ({
  status,
  slug,
}: updateServiceStatusProps): Promise<{
  error?: string;
  message?: string;
  success: boolean;
}> => {
  try {
    const prisma = await dbContext.service.update({
      where: {slug: slug},
      data: {status},
    });

    if (prisma.slug.length < 0) {
      return {
        error: "Couldn't update status",
        success: false,
        message: undefined,
      };
    }

    return {
      error: undefined,
      success: true,
      message: `Successfully updated status: ${prisma.status}`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : error;
    return {error: errorMessage as string, success: false, message: undefined};
  }
};
