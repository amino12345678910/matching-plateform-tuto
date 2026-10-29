/**
 * Client-safe platform constants (no server imports).
 * Shared by forms, legal pages, dashboards and server logic.
 */

export const PLATFORM_NAME = '9arrini';
export const PLATFORM_DOMAIN = 'www.9arrini.me';
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'amin.aa.aeid@gmail.com';

/** Legal operator identity — shown in the Terms & Conditions (CGU). */
export const LEGAL_OPERATOR = {
  name: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_NAME || 'Amin Elayed',
  status: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_STATUS || 'Auto-entrepreneur',
  registration: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_ID || '1969898S',
  d17: process.env.NEXT_PUBLIC_PAYMENT_D17_NUMBER || '92177031',
  address: process.env.NEXT_PUBLIC_LEGAL_OPERATOR_ADDRESS || 'Tunisie',
};

/** Business rules */
export const DEFAULT_COMMISSION_RATE = 0.15; // 15 %
export const TUTOR_SHARE_RATE = 0.85; // 85 %
export const DEFAULT_FREE_TRIAL_DAYS = 7;
export const AUTO_RELEASE_HOURS = 72;
export const STUDENT_CANCEL_MIN_HOURS = 24;
export const MIN_TOPUP_AMOUNT = 5;
export const MAX_TOPUP_AMOUNT = 2000;
export const MIN_PAYOUT_AMOUNT = 20;
export const TERMS_VERSION = '2026-10-29';
export const TUNIS_UTC_OFFSET_HOURS = 1; // Africa/Tunis = UTC+1, no DST

/**
 * 1-Week Free Launch Trial:
 * Active by default for the launch week so students can book sessions at 0 DT
 * without needing payment while Flouci integration is being finalized.
 */
export const FREE_TRIAL_DEFAULT_ACTIVE = true;

/** Manual payment details (D17 / transfer) */
export const PAYMENT_INFO = {
  d17Number: process.env.NEXT_PUBLIC_PAYMENT_D17_NUMBER || '92177031',
  rib: process.env.NEXT_PUBLIC_PAYMENT_RIB || '',
  holderName: process.env.NEXT_PUBLIC_PAYMENT_HOLDER_NAME || 'Amin Elayed',
};

export const PAYMENT_METHODS = [
  {value: 'D17', label: 'D17 (La Poste)'},
  {value: 'VIREMENT', label: 'Virement bancaire'},
  {value: 'POSTE', label: 'Mandat / Virement postal'},
] as const;

export const PAYOUT_METHODS = [
  {value: 'D17', label: 'D17 (numéro de téléphone)'},
  {value: 'RIB', label: 'Virement bancaire (RIB)'},
  {value: 'POSTE', label: 'Compte postal (RIP)'},
] as const;

/* ------------------------------------------------------------------ */
/* Tunisian education levels                                           */
/* ------------------------------------------------------------------ */

export type StudentLevel = 'PRIMAIRE' | 'COLLEGE' | 'LYCEE' | 'UNIVERSITE' | 'ADULTE';

export const STUDENT_LEVELS: {
  value: StudentLevel;
  label: string;
  grades: {value: string; label: string}[];
}[] = [
  {
    value: 'PRIMAIRE',
    label: 'École primaire',
    grades: [
      {value: '1ERE_PRIMAIRE', label: '1ère année primaire'},
      {value: '2EME_PRIMAIRE', label: '2ème année primaire'},
      {value: '3EME_PRIMAIRE', label: '3ème année primaire'},
      {value: '4EME_PRIMAIRE', label: '4ème année primaire'},
      {value: '5EME_PRIMAIRE', label: '5ème année primaire'},
      {value: '6EME_PRIMAIRE', label: '6ème année primaire'},
    ],
  },
  {
    value: 'COLLEGE',
    label: 'Collège',
    grades: [
      {value: '7EME', label: '7ème année de base'},
      {value: '8EME', label: '8ème année de base'},
      {value: '9EME', label: '9ème année de base'},
    ],
  },
  {
    value: 'LYCEE',
    label: 'Lycée',
    grades: [
      {value: '1ERE_LYCEE', label: '1ère année secondaire'},
      {value: '2EME_LYCEE', label: '2ème année secondaire'},
      {value: '3EME_LYCEE', label: '3ème année secondaire'},
      {value: 'BAC', label: '4ème année (Baccalauréat)'},
    ],
  },
  {
    value: 'UNIVERSITE',
    label: 'Université / Prépa',
    grades: [
      {value: 'PREPA', label: 'Classes préparatoires'},
      {value: 'LICENCE_1', label: 'Licence 1'},
      {value: 'LICENCE_2', label: 'Licence 2'},
      {value: 'LICENCE_3', label: 'Licence 3'},
      {value: 'MASTER', label: 'Master'},
      {value: 'INGENIEUR', label: 'Cycle ingénieur'},
      {value: 'DOCTORAT', label: 'Doctorat'},
    ],
  },
  {
    value: 'ADULTE',
    label: 'Adulte / Formation continue',
    grades: [
      {value: 'PROFESSIONNEL', label: 'Professionnel'},
      {value: 'AUTRE', label: 'Autre'},
    ],
  },
];

/** Sections only apply to lycée (2ème année and above) */
export const LYCEE_SECTIONS = [
  {value: 'MATH', label: 'Mathématiques'},
  {value: 'SCIENCES', label: 'Sciences expérimentales'},
  {value: 'TECHNIQUE', label: 'Sciences techniques'},
  {value: 'INFO', label: 'Sciences de l’informatique'},
  {value: 'ECO', label: 'Économie et gestion'},
  {value: 'LETTRES', label: 'Lettres'},
  {value: 'SPORT', label: 'Sport'},
];

export const SUBJECTS = [
  'Mathématiques',
  'Physique',
  'Chimie',
  'Sciences de la vie et de la terre',
  'Informatique',
  'Programmation',
  'Français',
  'Anglais',
  'Arabe',
  'Allemand',
  'Espagnol',
  'Italien',
  'Philosophie',
  'Histoire-Géographie',
  'Économie',
  'Gestion',
  'Comptabilité',
  'Technologie',
  'Électricité / Mécanique',
  'Musique',
  'Dessin / Arts',
  'Préparation concours',
  'Méthodologie / Soutien général',
];

export function getLevelLabel(level?: string | null): string {
  return STUDENT_LEVELS.find(l => l.value === level)?.label || '—';
}

export function getGradeLabel(grade?: string | null): string {
  for (const level of STUDENT_LEVELS) {
    const g = level.grades.find(x => x.value === grade);
    if (g) return g.label;
  }
  return grade || '—';
}

export function getSectionLabel(section?: string | null): string {
  return LYCEE_SECTIONS.find(s => s.value === section)?.label || section || '';
}

export function gradeNeedsSection(grade?: string | null): boolean {
  return grade === '2EME_LYCEE' || grade === '3EME_LYCEE' || grade === 'BAC';
}

/* ------------------------------------------------------------------ */
/* Tutor profile completeness                                          */
/* ------------------------------------------------------------------ */

export const TUTOR_BIO_MIN_LENGTH = 80;

export type TutorProfileInput = {
  image?: string | null;
  profilePhoto?: string | null;
  bio?: string | null;
  specialty?: string | null;
  experience?: string | null;
  credentials?: string | null;
  phone?: string | null;
  city?: string | null;
  subjects?: string[] | null;
  levelsTaught?: string[] | null;
  payoutMethod?: string | null;
  payoutAccount?: string | null;
  acceptedTutorTermsAt?: Date | string | null;
};

export function getTutorProfileCompleteness(p: TutorProfileInput) {
  const checks: {key: string; label: string; ok: boolean}[] = [
    {key: 'photo', label: 'Photo de profil', ok: Boolean(p.profilePhoto || p.image)},
    {
      key: 'bio',
      label: `Biographie (≥ ${TUTOR_BIO_MIN_LENGTH} caractères)`,
      ok: (p.bio || '').trim().length >= TUTOR_BIO_MIN_LENGTH,
    },
    {key: 'specialty', label: 'Spécialité', ok: Boolean(p.specialty?.trim())},
    {key: 'subjects', label: 'Matières enseignées', ok: (p.subjects || []).length > 0},
    {key: 'levels', label: 'Niveaux enseignés', ok: (p.levelsTaught || []).length > 0},
    {key: 'experience', label: 'Expérience', ok: Boolean(p.experience?.trim())},
    {key: 'credentials', label: 'Diplômes / références', ok: Boolean(p.credentials?.trim())},
    {key: 'phone', label: 'Téléphone', ok: (p.phone || '').replace(/\D/g, '').length >= 8},
    {key: 'city', label: 'Ville', ok: Boolean(p.city?.trim())},
    {
      key: 'payout',
      label: 'Moyen de paiement (D17 / RIB)',
      ok: Boolean(p.payoutMethod && p.payoutAccount?.trim()),
    },
    {key: 'terms', label: 'Conditions Professeurs acceptées', ok: Boolean(p.acceptedTutorTermsAt)},
  ];
  const done = checks.filter(c => c.ok).length;
  return {
    checks,
    missing: checks.filter(c => !c.ok),
    percent: Math.round((done / checks.length) * 100),
    isComplete: done === checks.length,
  };
}

/** Money helpers (Points = DT, 3 decimals = millimes) */
export function roundMoney(value: number): number {
  return Math.round((Number(value) || 0) * 1000) / 1000;
}

export function formatPoints(value: number): string {
  const v = roundMoney(value);
  return Number.isInteger(v) ? String(v) : v.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

export function splitCommission(price: number, rate = DEFAULT_COMMISSION_RATE) {
  const total = roundMoney(price);
  const platformFee = roundMoney(total * rate);
  return {total, platformFee, tutorEarning: roundMoney(total - platformFee)};
}

/** Valid real Google Meet link (xxx-xxxx-xxx) */
export const MEET_LINK_REGEX = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\?.*)?$/i;

/* ------------------------------------------------------------------ */
/* Session time (Africa/Tunis)                                         */
/* ------------------------------------------------------------------ */

/** Converts a Tunis local date (YYYY-MM-DD) + time (HH:mm) to an absolute Date. */
export function toSessionDate(dateStr?: string | null, timeStr?: string | null): Date | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '00:00').split(':').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d, (hh || 0) - TUNIS_UTC_OFFSET_HOURS, mm || 0, 0));
}

export function sessionEndDate(sessionAt: Date | string | null | undefined, durationMinutes = 60) {
  if (!sessionAt) return null;
  return new Date(new Date(sessionAt).getTime() + durationMinutes * 60 * 1000);
}

export function formatSessionLabel(sessionAt?: Date | string | null): string {
  if (!sessionAt) return 'Date à confirmer';
  return new Date(sessionAt).toLocaleString('fr-FR', {
    timeZone: 'Africa/Tunis',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
