'use server';

import {getUserInfo} from '@/hooks/shared/get-user-info';
import {prisma as dbContext} from '@/lib/prisma';
import {getAllRealServices} from '@/hooks/book/bookings-store';

export type ServiceNavLite = {
  id: string;
  updatedAt: Date;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'REJECTED';
  title: string;
  slug: string;
  packages: {
    price: number;
  }[];
  _count: {
    reviews: number;
    bookings: number;
  };
};

async function getMyServicesLite(): Promise<ServiceNavLite[]> {
  const {userId} = await getUserInfo();
  if (!userId) return [];

  try {
    const services = await dbContext.service.findMany({
      where: {seller: {userId}},
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        packages: {select: {price: true}},
        _count: {select: {reviews: true, bookings: true}},
      },
      orderBy: {updatedAt: 'desc'},
    });

    return services;
  } catch {
    const all = await getAllRealServices();
    return all
      .filter(s => s.freelancerId === userId || s.seller?.userId === userId)
      .map(s => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        status: s.status || 'ACTIVE',
        updatedAt: new Date(s.updatedAt || Date.now()),
        packages: (s.packages || []).map((p: any) => ({price: p.price})),
        _count: s._count || {reviews: 0, bookings: 0},
      }));
  }
}

export default getMyServicesLite;
