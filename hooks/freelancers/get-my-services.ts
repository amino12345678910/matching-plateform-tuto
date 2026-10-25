'use server';

import {prisma as dbContext} from '@/lib/prisma';
import {getUserInfo} from '../shared/get-user-info';
import type {ServiceCardLite} from '@/types/service-lite';
import {getAllCloudServices} from '@/lib/cloud-store';

async function getMyServices(): Promise<ServiceCardLite[]> {
  const {userId} = await getUserInfo();
  if (!userId) return [];

  try {
    const services = await dbContext.service.findMany({
      where: {seller: {userId}},
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        status: true,
        updatedAt: true,
        bookings: {
          orderBy: {createdAt: 'desc'},
          include: {
            client: {select: {name: true, email: true, image: true, imageSource: true}},
            service: {
              select: {
                packages: true,
                slug: true,
                title: true,
              },
            },
          },
        },
        packages: {
          take: 2,
          select: {name: true, price: true, delivery: true},
          orderBy: {price: 'asc'},
        },
        _count: {select: {bookings: true}},
      },
      orderBy: {updatedAt: 'desc'},
      take: 20,
    });

    if (services.length > 0) {
      return services.map(s => ({
        ...s,
        images: s.images ?? [],
        bookings: s.bookings?.map(b => ({
          ...b,
          hasSeen: b.hasSeen ?? undefined,
          client: {
            ...b.client,
            image: b.client.image ?? undefined,
          },
        })),
      }));
    }
  } catch {
    // Cloud fallback
  }

  const allServices = getAllCloudServices();
  return allServices
    .filter(s => s.freelancerId === userId || s.seller?.userId === userId)
    .map(s => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      images: s.images || ['/assets/seo.webp'],
      status: s.status || 'ACTIVE',
      updatedAt: new Date(s.updatedAt || Date.now()),
      bookings: [],
      packages: (s.packages || []).slice(0, 2),
      _count: s._count || {bookings: 0},
    })) as any;
}

export default getMyServices;
