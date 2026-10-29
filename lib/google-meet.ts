/**
 * Real Video Meeting & Google Meet Schedule Helper for 9arrini Sessions.
 *
 * IMPORTANT:
 * Google Meet does NOT allow arbitrary/random `meet.google.com/xxx-xxxx-xxx` codes unless
 * the meeting was actually created on Google's servers (via `https://meet.google.com/new`
 * or Google Calendar). Therefore:
 * 1. We NEVER fabricate fake `https://meet.google.com/xxx-xxxx-xxx` links.
 * 2. If a tutor pastes a real Google Meet link (created via `https://meet.google.com/new`),
 *    we preserve and use that exact `https://meet.google.com/xxx-xxxx-xxx` URL.
 * 3. Otherwise, we generate a real, deterministic 9arrini Live Classroom URL (`/meet/<room>`)
 *    that hosts a real WebRTC video call AND lets the tutor attach a real `meet.google.com/new`
 *    link in one click at any time.
 */

export interface ScheduledMeetInfo {
  meetCode: string;
  meetUrl: string;
  externalShareUrl: string;
  isCustomGoogleMeet: boolean;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  durationMinutes: number;
  formattedDateLabel: string;
  googleCalendarUrl: string;
}

const LETTERS = 'abcdefghijkmnopqrstuvwxyz';

/**
 * Computes the old deterministic fake code only so we can detect and strip
 * previously auto-generated fake `meet.google.com/xxx-xxxx-xxx` links.
 */
function computeLegacyFakeCode(seed: string): string {
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

/**
 * Generates a real, deterministic 9arrini live classroom slug from a course slug/title.
 */
export function generateMeetCode(seed?: string): string {
  const raw = (seed || 'seance-cours')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);

  let hash = 5381;
  const s = seed || '9arrini-default';
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 33) ^ s.charCodeAt(i);
  }
  const suffix = (Math.abs(hash) % 9000 + 1000).toString();
  return `9arrini-${raw || 'cours'}-${suffix}`;
}

/**
 * Checks whether a candidate URL is a real tutor-provided Google Meet link
 * (and NOT one of the legacy deterministic fake codes).
 */
export function isRealGoogleMeetUrl(
  url?: string | null,
  possibleSeeds: (string | undefined)[] = []
): boolean {
  if (!url) return false;
  const clean = url.trim();
  const match = clean.match(/^https:\/\/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})(?:[/?#].*)?$/i);
  if (!match) return false;

  const code = match[1].toLowerCase();
  const seedsToCheck = [
    ...possibleSeeds.filter((s): s is string => Boolean(s)),
    '9arrini',
  ];

  for (const seed of seedsToCheck) {
    if (computeLegacyFakeCode(seed) === code) {
      return false;
    }
  }
  return true;
}

export function normalizeGoogleMeetInput(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const fullMatch = trimmed.match(/https:\/\/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/i);
  if (fullMatch) {
    return `https://meet.google.com/${fullMatch[1].toLowerCase()}`;
  }
  const codeOnly = trimmed.match(/^([a-z]{3}-[a-z]{4}-[a-z]{3})$/i);
  if (codeOnly) {
    return `https://meet.google.com/${codeOnly[1].toLowerCase()}`;
  }
  return null;
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

  const fullUrl = params.meetUrl.startsWith('/')
    ? `https://www.9arrini.me${params.meetUrl}`
    : params.meetUrl;

  const details = [
    `Séance de cours particulier sur 9arrini.me`,
    params.tutorName ? `Professeur : ${params.tutorName}` : '',
    `Lien direct de la séance vidéo : ${fullUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: `🎓 9arrini : ${params.title}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details,
    location: fullUrl,
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
  let extractedMeet = service.meetLink;
  let extractedDate = service.scheduledDate;
  let extractedTime = service.scheduledTime;

  if (service.description) {
    const meetMatch = service.description.match(
      /https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/i
    );
    if (!extractedMeet && meetMatch) {
      extractedMeet = meetMatch[0];
    }
    const roomMatch = service.description.match(/\/meet\/(9arrini-[a-z0-9-]+)/i);
    if (!extractedMeet && roomMatch) {
      extractedMeet = `/meet/${roomMatch[1]}`;
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

  const seeds = [service.slug, service.id, service.title];
  const hasRealGoogleMeet = isRealGoogleMeetUrl(extractedMeet, seeds);

  let meetCode: string;
  let meetUrl: string;
  let externalShareUrl: string;

  if (hasRealGoogleMeet && extractedMeet) {
    const normalized = normalizeGoogleMeetInput(extractedMeet)!;
    meetCode = normalized.replace('https://meet.google.com/', '');
    meetUrl = normalized;
    externalShareUrl = normalized;
  } else {
    const roomMatch = extractedMeet?.match(/\/meet\/([a-z0-9-]+)/i);
    meetCode = roomMatch
      ? roomMatch[1]
      : generateMeetCode(service.slug || service.id || service.title || '9arrini');
    meetUrl = `/meet/${meetCode}`;
    externalShareUrl = `https://www.9arrini.me/meet/${meetCode}`;
  }

  const scheduledDate = extractedDate || getDefaultSessionDate(2);
  const scheduledTime = extractedTime || '18:00';
  const durationMinutes = 60;

  return {
    meetCode,
    meetUrl,
    externalShareUrl,
    isCustomGoogleMeet: hasRealGoogleMeet,
    scheduledDate,
    scheduledTime,
    durationMinutes,
    formattedDateLabel: formatScheduleLabel(scheduledDate, scheduledTime),
    googleCalendarUrl: buildGoogleCalendarMeetUrl({
      title: service.title || 'Séance de cours 9arrini',
      meetUrl: externalShareUrl,
      dateStr: scheduledDate,
      timeStr: scheduledTime,
      durationMinutes,
      tutorName: service.seller?.user?.name,
    }),
  };
}
