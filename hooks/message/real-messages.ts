'use server';

import {getUserInfo} from '@/hooks/shared/get-user-info';
import {readCloudStore, writeCloudStore, type CloudChatMessage} from '@/lib/cloud-store';
import {
  getAllRealServices,
  getClientBookingsCookie,
  getMessagesCookie,
  saveMessageCookie,
  saveClientNotificationCookie,
} from '@/hooks/book/bookings-store';
import {getServiceMeetInfo} from '@/lib/google-meet';

export interface RealChatContact {
  id: string;
  name: string;
  specialty: string;
  courseTitle: string;
  courseSlug: string;
  avatar: string;
  phone: string;
  meetUrl: string;
  scheduleLabel: string;
}

export async function getRealMessagingState(queryParams?: {
  tutorId?: string | null;
  tutorName?: string | null;
  course?: string | null;
  slug?: string | null;
}) {
  const u = await getUserInfo();
  const myId = u.userId || '';
  const myName = u.name || 'Utilisateur 9arrini';
  const myRole = u.role || 'USER';

  const allServices = await getAllRealServices();
  const cookieBookings = myId ? await getClientBookingsCookie(myId) : [];
  const store = readCloudStore();
  const cookieMsgs = await getMessagesCookie();

  const contactsMap = new Map<string, RealChatContact>();

  // 1. Add contacts from real bookings (both student's tutors and tutor's students)
  const allUserBookings = [
    ...cookieBookings,
    ...(store.bookings || []).filter(b => b.clientId === myId || b.freelancerId === myId),
  ];

  for (const b of allUserBookings) {
    const isMeClient = b.clientId === myId;
    const otherId = isMeClient ? b.freelancerId : b.clientId;
    const otherName = isMeClient ? b.freelancerName : b.clientName;
    if (!otherId || otherId === myId) continue;

    const meet = getServiceMeetInfo({
      slug: b.serviceSlug,
      title: b.serviceTitle,
      scheduledDate: b.scheduledDate,
      scheduledTime: b.scheduledTime,
      meetLink: b.meetUrl,
    });

    if (!contactsMap.has(otherId)) {
      contactsMap.set(otherId, {
        id: otherId,
        name: otherName || (isMeClient ? 'Professeur' : 'Élève'),
        specialty: isMeClient ? 'Cours Réservé' : 'Élève Inscrit',
        courseTitle: b.serviceTitle,
        courseSlug: b.serviceSlug,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          otherName || 'U'
        )}&background=059669&color=fff&bold=true`,
        phone: b.tutorPhone || '',
        meetUrl: meet.meetUrl,
        scheduleLabel: meet.formattedDateLabel,
      });
    }
  }

  // 2. Add contacts from real published courses on the platform
  for (const s of allServices) {
    const tId = s.freelancerId || s.seller?.userId;
    if (!tId || tId === myId) continue;
    const tName = s.seller?.user?.name || 'Professeur 9arrini';
    const meet = getServiceMeetInfo(s as any);
    if (!contactsMap.has(tId)) {
      contactsMap.set(tId, {
        id: tId,
        name: tName,
        specialty: s.category?.name || s.seller?.specialty || 'Professeur 9arrini',
        courseTitle: s.title,
        courseSlug: s.slug,
        avatar:
          s.seller?.user?.image ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            tName
          )}&background=059669&color=fff&bold=true`,
        phone: s.seller?.phone || '',
        meetUrl: meet.meetUrl,
        scheduleLabel: meet.formattedDateLabel,
      });
    }
  }

  // 3. Add contact from URL query parameters if user clicked "Message 9arrini" on a course/booking
  const qId = queryParams?.tutorId?.trim();
  const qName = queryParams?.tutorName?.trim();
  if (qId && qName && qId !== myId && !contactsMap.has(qId)) {
    const meet = getServiceMeetInfo({
      slug: queryParams?.slug || queryParams?.course || 'session',
      title: queryParams?.course || 'Cours 9arrini',
    });
    contactsMap.set(qId, {
      id: qId,
      name: qName,
      specialty: 'Professeur 9arrini',
      courseTitle: queryParams?.course || 'Cours 9arrini',
      courseSlug: queryParams?.slug || '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        qName
      )}&background=059669&color=fff&bold=true`,
      phone: '',
      meetUrl: meet.meetUrl,
      scheduleLabel: meet.formattedDateLabel,
    });
  }

  // 4. Collect all real messages involving current user
  const allMessagesRaw = [...cookieMsgs, ...(store.messages || [])];
  const uniqueMsgs = Array.from(new Map(allMessagesRaw.map(m => [m.id, m])).values());

  // Also add any sender/recipient from existing real messages into contactsMap
  for (const m of uniqueMsgs) {
    if (m.senderId === myId && m.recipientId && !contactsMap.has(m.recipientId)) {
      contactsMap.set(m.recipientId, {
        id: m.recipientId,
        name: m.recipientName || 'Contact 9arrini',
        specialty: 'Discussion directe',
        courseTitle: 'Messagerie 9arrini',
        courseSlug: '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          m.recipientName || 'C'
        )}&background=059669&color=fff&bold=true`,
        phone: '',
        meetUrl: '',
        scheduleLabel: '',
      });
    } else if (m.recipientId === myId && m.senderId && !contactsMap.has(m.senderId)) {
      contactsMap.set(m.senderId, {
        id: m.senderId,
        name: m.senderName || 'Contact 9arrini',
        specialty: 'Discussion directe',
        courseTitle: 'Messagerie 9arrini',
        courseSlug: '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          m.senderName || 'C'
        )}&background=059669&color=fff&bold=true`,
        phone: '',
        meetUrl: '',
        scheduleLabel: '',
      });
    }
  }

  return {
    currentUser: {id: myId, name: myName, role: myRole},
    contacts: Array.from(contactsMap.values()),
    messages: uniqueMsgs.filter(
      m => m.senderId === myId || m.recipientId === myId || (myId && m.roomId.includes(myId))
    ),
  };
}

export async function sendRealChatMessage(input: {
  recipientId: string;
  recipientName: string;
  text: string;
}) {
  const u = await getUserInfo();
  const senderId = u.userId || 'guest';
  const senderName = u.name || 'Utilisateur 9arrini';
  const cleanText = (input.text || '').trim();
  if (!cleanText || !input.recipientId) {
    return {success: false};
  }

  const roomId = [senderId, input.recipientId].sort().join('--');
  const msg: CloudChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    roomId,
    senderId,
    senderName,
    recipientId: input.recipientId,
    recipientName: input.recipientName,
    text: cleanText,
    createdAt: new Date().toISOString(),
  };

  await saveMessageCookie(msg);

  try {
    const store = readCloudStore();
    if (!Array.isArray(store.messages)) store.messages = [];
    store.messages.push(msg);
    if (!Array.isArray(store.notifications)) store.notifications = [];
    store.notifications.unshift({
      id: `notif_msg_${Date.now()}`,
      userId: input.recipientId,
      title: `💬 Nouveau message de ${senderName} : "${cleanText.slice(0, 60)}"`,
      type: 'MESSAGE',
      link: `/dashboard/messages?tutorId=${encodeURIComponent(senderId)}&tutorName=${encodeURIComponent(senderName)}`,
      read: false,
      createdAt: msg.createdAt,
    });
    writeCloudStore(store);
  } catch {
    // ignore
  }

  await saveClientNotificationCookie({
    id: `notif_msg_${Date.now()}`,
    userId: input.recipientId,
    title: `💬 Nouveau message de ${senderName} : "${cleanText.slice(0, 60)}"`,
    type: 'MESSAGE',
    link: `/dashboard/messages?tutorId=${encodeURIComponent(senderId)}&tutorName=${encodeURIComponent(senderName)}`,
    read: false,
    createdAt: msg.createdAt,
  });

  return {success: true, message: msg};
}
