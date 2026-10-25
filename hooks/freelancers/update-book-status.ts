'use server';

import {prisma} from '@/lib/prisma';
import type {BookingStatus} from '@/types/bookings';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';

type updateBookingStatusProps = {
  bookingId: string;
  freelancerId: string;
  status: BookingStatus;
};
export async function updateBookingStatus({
  bookingId,
  freelancerId,
  status,
}: updateBookingStatusProps) {
  try {
    const booking = await prisma.booking.findUnique({
      where: {id: bookingId},
    });

    if (booking) {
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
  } catch {
    // Cloud fallback
  }

  const store = readCloudStore();
  const cloudBooking = store.bookings.find(b => b.id === bookingId);
  if (!cloudBooking) {
    return {error: 'Booking not found'};
  }
  cloudBooking.status = status as any;
  writeCloudStore(store);

  return {success: true};
}
