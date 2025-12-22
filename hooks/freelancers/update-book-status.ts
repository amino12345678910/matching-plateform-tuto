'use server';

import {prisma} from '@/lib/prisma';
import type {BookingStatus} from '@/types/service';

export async function updateBookingStatus({
  bookingId,
  freelancerId,
  status,
}: {
  bookingId: string;
  freelancerId: string;
  status: BookingStatus;
}) {
  const booking = await prisma.booking.findUnique({
    where: {id: bookingId},
  });

  if (!booking) {
    return {error: 'Booking not found'};
  }

  if (booking.freelancerId !== freelancerId) {
    return {error: 'Unauthorized'};
  }

  if (booking.status !== 'PENDING') {
    return {error: 'Booking is already finalized'};
  }

  await prisma.booking.updateMany({
    where: {id: bookingId},
    data: {status, acceptedAt: status === 'CONFIRMED' ? new Date() : null},
  });

  return {success: true};
}
