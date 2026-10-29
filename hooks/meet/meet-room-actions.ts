'use server';

import {prisma} from '@/lib/prisma';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
import {normalizeGoogleMeetInput, generateMeetCode, formatScheduleLabel} from '@/lib/google-meet';
import {revalidatePath} from 'next/cache';

export async function getRoomMeetState(roomCode: string): Promise<{
  googleMeetUrl: string | null;
  courseTitle: string;
  tutorName: string;
  scheduledLabel: string;
}> {
  const cleanRoom = (roomCode || '').trim();
  let googleMeetUrl: string | null = null;
  let courseTitle = 'Séance de cours particulier 9arrini';
  let tutorName = 'Professeur 9arrini';
  let scheduledLabel = formatScheduleLabel();

  // 1. Check Prisma Service / Booking if reachable
  try {
    const services = await prisma.service.findMany({
      take: 50,
      orderBy: {updatedAt: 'desc'},
      include: {seller: {include: {user: true}}},
    });
    for (const srv of services) {
      const code = generateMeetCode(srv.slug || srv.id || srv.title);
      if (code === cleanRoom || srv.meetLink?.includes(cleanRoom) || srv.slug === cleanRoom) {
        courseTitle = srv.title || courseTitle;
        tutorName = srv.seller?.user?.name || tutorName;
        scheduledLabel = formatScheduleLabel(srv.scheduledDate || undefined, srv.scheduledTime || undefined);
        const normalized = normalizeGoogleMeetInput(srv.meetLink);
        if (normalized) googleMeetUrl = normalized;
        break;
      }
    }
  } catch {
    // Cloud fallback
  }

  // 2. Check Cloud Store services & bookings
  try {
    const store = readCloudStore();
    for (const srv of store.customServices || []) {
      const code = generateMeetCode(srv.slug || srv.id || srv.title);
      if (
        code === cleanRoom ||
        srv.meetLink?.includes(cleanRoom) ||
        srv.slug === cleanRoom
      ) {
        courseTitle = srv.title || courseTitle;
        tutorName = srv.seller?.user?.name || tutorName;
        scheduledLabel = formatScheduleLabel(srv.scheduledDate, srv.scheduledTime);
        const normalized = normalizeGoogleMeetInput(srv.meetLink);
        if (normalized) {
          googleMeetUrl = normalized;
        }
        break;
      }
    }

    for (const bk of store.bookings || []) {
      const code = generateMeetCode(bk.serviceSlug || bk.serviceId || bk.serviceTitle);
      if (code === cleanRoom || bk.meetUrl?.includes(cleanRoom)) {
        courseTitle = bk.serviceTitle || courseTitle;
        tutorName = bk.freelancerName || tutorName;
        scheduledLabel = formatScheduleLabel(bk.scheduledDate, bk.scheduledTime);
        const normalized = normalizeGoogleMeetInput(bk.meetUrl);
        if (normalized) {
          googleMeetUrl = normalized;
        }
        break;
      }
    }
  } catch {
    // ignore
  }

  return {
    googleMeetUrl,
    courseTitle,
    tutorName,
    scheduledLabel,
  };
}

export async function saveRoomGoogleMeetUrl(input: {
  roomCode: string;
  googleMeetUrl: string;
  serviceSlug?: string;
}): Promise<{
  success: boolean;
  googleMeetUrl?: string;
  error?: string;
}> {
  const normalized = normalizeGoogleMeetInput(input.googleMeetUrl);
  if (!normalized) {
    return {
      success: false,
      error:
        'Veuillez coller un vrai lien Google Meet valide (ex: https://meet.google.com/abc-defg-hij créé depuis meet.google.com/new).',
    };
  }

  const cleanRoom = (input.roomCode || '').trim();

  // 1. Save in Prisma Service/Booking if reachable
  try {
    if (input.serviceSlug) {
      await prisma.service.updateMany({
        where: {slug: input.serviceSlug},
        data: {meetLink: normalized},
      });
    } else {
      const services = await prisma.service.findMany({take: 50});
      for (const srv of services) {
        const code = generateMeetCode(srv.slug || srv.id || srv.title);
        if (code === cleanRoom || srv.meetLink?.includes(cleanRoom)) {
          await prisma.service.update({
            where: {id: srv.id},
            data: {meetLink: normalized},
          });
        }
      }
    }
  } catch {
    // Cloud fallback
  }

  // 2. Save in Cloud Store
  try {
    const store = readCloudStore();
    for (const srv of store.customServices || []) {
      const code = generateMeetCode(srv.slug || srv.id || srv.title);
      if (
        code === cleanRoom ||
        srv.meetLink?.includes(cleanRoom) ||
        (input.serviceSlug && srv.slug === input.serviceSlug)
      ) {
        srv.meetLink = normalized;
      }
    }

    for (const bk of store.bookings || []) {
      const code = generateMeetCode(bk.serviceSlug || bk.serviceId || bk.serviceTitle);
      if (
        code === cleanRoom ||
        bk.meetUrl?.includes(cleanRoom) ||
        (input.serviceSlug && bk.serviceSlug === input.serviceSlug)
      ) {
        bk.meetUrl = normalized;
      }
    }

    writeCloudStore(store);
  } catch {
    // ignore
  }

  revalidatePath(`/meet/${cleanRoom}`);
  revalidatePath('/dashboard/client/bookings');
  revalidatePath('/dashboard/freelancer/orders');
  revalidatePath('/dashboard/freelancer/manage');

  return {
    success: true,
    googleMeetUrl: normalized,
  };
}
