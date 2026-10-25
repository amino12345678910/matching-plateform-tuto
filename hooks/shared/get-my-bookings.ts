import {prisma as dbContext} from '@/lib/prisma';
import {type UserInfo} from './get-user-info';
import type {BookedServiceType} from '@/types/bookings';
import {readCloudStore, getAllCloudServices} from '@/lib/cloud-store';

type Role = 'CLIENT' | 'FREELANCER';

async function getMyBookings({
  user,
  role = 'CLIENT',
}: {
  user: UserInfo;
  role?: Role;
}): Promise<BookedServiceType[]> {
  const isClient = role === 'CLIENT';

  try {
    const bookings = await dbContext.booking.findMany({
      where: isClient ? {clientId: user.userId} : {freelancerId: user.userId},
      select: {
        hasSeen: true,
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            status: true,
            updatedAt: true,
            packages: {
              select: {
                name: true,
                price: true,
                delivery: true,
              },
            },
            freelancer: isClient
              ? {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    imageSource: true,
                  },
                }
              : false,
          },
        },
        client: !isClient
          ? {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                imageSource: true,
              },
            }
          : false,
      },
      orderBy: {updatedAt: 'desc'},
    });

    if (bookings.length > 0) {
      return bookings.map(booking => {
        const service = booking.service;
        return {
          ...service,
          hasSeen: booking.hasSeen ?? undefined,
          images: service.images ?? [],
          counterparty: isClient
            ? {
                ...service.freelancer,
                image: service.freelancer.image ?? undefined,
              }
            : {
                ...booking.client,
                image: booking.client.image ?? undefined,
              },
        };
      });
    }
  } catch {
    // Cloud fallback
  }

  const store = readCloudStore();
  const allServices = getAllCloudServices();
  const userBookings = store.bookings.filter(b =>
    isClient ? b.clientId === user.userId : b.freelancerId === user.userId
  );

  return userBookings.map(b => {
    const matchedService = allServices.find(s => s.id === b.serviceId || s.slug === b.serviceSlug);
    return {
      id: b.serviceId,
      title: b.serviceTitle,
      slug: b.serviceSlug,
      images: matchedService?.images || ['/assets/seo.webp'],
      status: 'ACTIVE' as const,
      updatedAt: new Date(b.createdAt),
      packages: matchedService?.packages || [
        {name: b.servicePackageTier, price: b.totalPrice, delivery: b.delivery},
      ],
      counterparty: isClient
        ? {
            id: b.freelancerId,
            name: b.freelancerName,
            email: 'prof@9arrini.tn',
            imageSource: 'NULL' as const,
          }
        : {
            id: b.clientId,
            name: b.clientName,
            email: b.clientEmail,
            imageSource: 'NULL' as const,
          },
    } as any;
  });
}

export {getMyBookings};
