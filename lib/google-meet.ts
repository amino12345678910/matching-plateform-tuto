/**
 * Automatic Google Meet Link & Schedule Generator for 9arrini Sessions
 */

export interface ScheduledMeetInfo {
  meetCode: string;
  meetUrl: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  durationMinutes: number;
  formattedDateLabel: string;
  googleCalendarUrl: string;
}

const LETTERS = 'abcdefghijkmnopqrstuvwxyz';

/**
 * Generates a realistic, deterministic Google Meet code (xxx-xxxx-xxx) from a seed string,
 * or a random one if no seed is provided.
 */
export function generateMeetCode(seed?: string): string {
  if (!seed) {
    const pick = (len: number) =>
      Array.from({length: len}, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');
    return `${pick(3)}-${pick(4)}-${pick(3)}`;
  }

  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const chars: string[] = [];
  let h = Math.abs(hash) || 123456789;
  for (let i = 0; i < 10; i++) {
    chars.push(LETTERS[(h + i * 7) % LETTERS.length]);
    h = Math.floor(h / 3) ^ (h << 5);
    h = Math.abs(h) || 9876543;
  }

  return `${chars.slice(0, 3).join('')}-${chars.slice(3, 7).join('')}-${chars.slice(7, 10).join('')}`;
}

export function getDefaultSessionDate(daysAhead = 2): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

export function formatScheduleLabel(dateStr?: string, timeStr?: string): string {
  const safeDate = dateStr || getDefaultSessionDate(2);
  const safeTime = timeStr || '18:00';
  try {
    const [year, month, day] = safeDate.split('-').map(Number);
    const dt = new Date(year, (month || 1) - 1, day || 1);
    const formatted = dt.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${formatted} à ${safeTime}`;
  } catch {
    return `${safeDate} à ${safeTime}`;
  }
}

export function buildGoogleCalendarMeetUrl(params: {
  title: string;
  meetUrl: string;
  dateStr?: string;
  timeStr?: string;
  durationMinutes?: number;
  tutorName?: string;
}): string {
  const safeDate = params.dateStr || getDefaultSessionDate(2);
  const safeTime = params.timeStr || '18:00';
  const duration = params.durationMinutes || 60;

  const [y, m, d] = safeDate.split('-').map(Number);
  const [hh, mm] = safeTime.split(':').map(Number);

  const start = new Date(Date.UTC(y || 2026, (m || 1) - 1, d || 1, (hh || 18) - 1, mm || 0, 0));
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const fmt = (dt: Date) =>
    dt
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');

  const details = [
    `Séance de cours particulier sur 9arrini.me`,
    params.tutorName ? `Professeur : ${params.tutorName}` : '',
    `Lien Google Meet direct : ${params.meetUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: `🎓 9arrini : ${params.title}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details,
    location: params.meetUrl,
  });

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

export function getServiceMeetInfo(service: {
  id?: string;
  slug?: string;
  title?: string;
  meetLink?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  description?: string;
  seller?: {user?: {name?: string}};
}): ScheduledMeetInfo {
  // Check if embedded in description or service fields
  let extractedMeet = service.meetLink;
  let extractedDate = service.scheduledDate;
  let extractedTime = service.scheduledTime;

  if (service.description) {
    const meetMatch = service.description.match(/https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/i);
    if (!extractedMeet && meetMatch) {
      extractedMeet = meetMatch[0];
    }
    const dateMatch = service.description.match(/data-session-date="([^"]+)"/);
    if (!extractedDate && dateMatch) {
      extractedDate = dateMatch[1];
    }
    const timeMatch = service.description.match(/data-session-time="([^"]+)"/);
    if (!extractedTime && timeMatch) {
      extractedTime = timeMatch[1];
    }
  }

  const meetCode = extractedMeet
    ? extractedMeet.replace('https://meet.google.com/', '')
    : generateMeetCode(service.slug || service.id || service.title || '9arrini');
  const meetUrl = `https://meet.google.com/${meetCode}`;
  const scheduledDate = extractedDate || getDefaultSessionDate(2);
  const scheduledTime = extractedTime || '18:00';
  const durationMinutes = 60;

  return {
    meetCode,
    meetUrl,
    scheduledDate,
    scheduledTime,
    durationMinutes,
    formattedDateLabel: formatScheduleLabel(scheduledDate, scheduledTime),
    googleCalendarUrl: buildGoogleCalendarMeetUrl({
      title: service.title || 'Séance de cours 9arrini',
      meetUrl,
      dateStr: scheduledDate,
      timeStr: scheduledTime,
      durationMinutes,
      tutorName: service.seller?.user?.name,
    }),
  };
}
