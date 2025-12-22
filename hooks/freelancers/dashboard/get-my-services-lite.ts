'use server';

import {getUserInfo} from '@/hooks/get-user-info';
import {prisma as dbContext} from '@/lib/prisma';

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
}

export default getMyServicesLite;
