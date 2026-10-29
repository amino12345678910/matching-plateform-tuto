'use server';

import {createHmac, timingSafeEqual} from 'crypto';
import {cookies} from 'next/headers';
import {prisma} from '@/lib/prisma';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
import {hashPassword, verifyPassword, validatePasswordStrength} from '@/lib/password';
import {
  saveSellerRegistryCookie,
  saveClientNotificationCookie,
  getSellersRegistryCookie,
} from '@/hooks/book/bookings-store';

const SESSION_COOKIE_NAME = '9arrini_user_session_v4';
const ACCOUNT_BACKUP_COOKIE = '9arrini_account_backup_v4';

function getSessionSecret(): string {
  return (
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    '9arrini-default-hmac-secret-change-in-production-2026'
  );
}

function isConfiguredAdminEmail(email: string): boolean {
  const clean = email.trim().toLowerCase();
  const configured = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'amin.aa.aeid@gmail.com')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  return configured.includes(clean);
}

export interface SessionCookiePayload {
  userId: string;
  name: string;
  email: string;
  role: 'USER' | 'FREELANCER' | 'SELLER' | 'ADMIN';
  points: number;
  image?: string | null;
  imageSource: 'NULL' | 'GOOGLE' | 'CLOUDINARY';
  hasPassword: boolean;
  passwordHash?: string;
  emailVerified: boolean;
  phone?: string | null;
  city?: string | null;
  studentLevel?: string | null;
  studentGrade?: string | null;
  studentSection?: string | null;
  institution?: string | null;
  subjectsOfInterest?: string[];
  acceptedTermsAt?: string | null;
  createdAt: string;
}

function signPayload(base64Payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(base64Payload).digest('base64url');
}

function encodeSession(payload: SessionCookiePayload): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = signPayload(body);
  return `${body}.${sig}`;
}

function decodeSession(raw: string): SessionCookiePayload | null {
  try {
    const parts = raw.split('.');
    if (parts.length !== 2) {
      return null;
    }
    const [body, sig] = parts;
    if (!body || !sig) return null;
    const expectedSig = signPayload(body);
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
    const json = Buffer.from(body, 'base64url').toString('utf-8');
    return JSON.parse(json) as SessionCookiePayload;
  } catch {
    return null;
  }
}

export async function getCloudSessionCookie(): Promise<SessionCookiePayload | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!raw) return null;
    const session = decodeSession(raw);
    if (!session || !session.userId) return null;

    const normalizedRole: 'USER' | 'SELLER' | 'ADMIN' =
      session.role === 'ADMIN' || isConfiguredAdminEmail(session.email)
        ? 'ADMIN'
        : session.role === 'SELLER' || session.role === 'FREELANCER'
        ? 'SELLER'
        : 'USER';
    session.role = normalizedRole;

    // Ensure user also exists in cloud store (in case of serverless cold start)
    try {
      const store = readCloudStore();
      const existing = store.users.find(
        u => u.id === session.userId || u.email.toLowerCase() === session.email.toLowerCase()
      );
      if (!existing) {
        store.users.push({
          id: session.userId,
          name: session.name,
          email: session.email,
          password: session.passwordHash,
          role: normalizedRole === 'ADMIN' ? 'ADMIN' : normalizedRole,
          points: session.points ?? 0,
          image: session.image ?? null,
          imageSource: session.imageSource || 'NULL',
          hasPassword: session.hasPassword ?? true,
          emailVerified: true,
          phone: session.phone ?? null,
          city: session.city ?? null,
          studentLevel: session.studentLevel ?? null,
          studentGrade: session.studentGrade ?? null,
          studentSection: session.studentSection ?? null,
          institution: session.institution ?? null,
          subjectsOfInterest: session.subjectsOfInterest || [],
          acceptedTermsAt: session.acceptedTermsAt ?? null,
          createdAt: session.createdAt || new Date().toISOString(),
        });
        if (normalizedRole === 'SELLER') {
          const hasSeller = store.sellers.some(s => s.userId === session.userId);
          if (!hasSeller) {
            store.sellers.push({
              id: `seller_${session.userId}`,
              userId: session.userId,
              bio: `Professeur ${session.name} sur 9arrini`,
              isVerified: false,
              verificationStatus: 'PENDING',
              createdAt: new Date().toISOString(),
            });
          }
        }
        writeCloudStore(store);
      } else if (typeof session.points === 'number') {
        existing.points = session.points;
        if (session.studentLevel) existing.studentLevel = session.studentLevel;
        if (session.studentGrade) existing.studentGrade = session.studentGrade;
        if (session.studentSection) existing.studentSection = session.studentSection;
        if (session.institution) existing.institution = session.institution;
        if (session.city) existing.city = session.city;
        if (session.phone) existing.phone = session.phone;
        if (session.acceptedTermsAt) existing.acceptedTermsAt = session.acceptedTermsAt;
        writeCloudStore(store);
      } else if (typeof existing.points === 'number') {
        session.points = existing.points;
      }
    } catch {
      // Ignore fs/tmp errors on read-only edge environments
    }

    return session;
  } catch {
    return null;
  }
}

export async function getSessionCookieNames() {
  return {SESSION_COOKIE_NAME, ACCOUNT_BACKUP_COOKIE};
}

export async function encodeSessionCookieValue(payload: SessionCookiePayload): Promise<string> {
  return encodeSession(payload);
}

export async function setCloudSessionCookie(payload: SessionCookiePayload) {
  try {
    const cookieStore = await cookies();
    const encoded = encodeSession(payload);
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    };
    cookieStore.set(SESSION_COOKIE_NAME, encoded, cookieOpts);
    cookieStore.set(ACCOUNT_BACKUP_COOKIE, encoded, cookieOpts);
  } catch {
    // Ignore if called inside a Server Component render rather than Server Action
  }
}

export async function clearCloudSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(ACCOUNT_BACKUP_COOKIE);
    cookieStore.delete('9arrini_user_session');
  } catch {
    // ignore
  }
}

export async function cloudSignUp(input: {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'SELLER' | 'FREELANCER';
  specialty?: string;
  credentials?: string;
  experience?: string;
  phone?: string;
  city?: string;
  bio?: string;
  subjects?: string[];
  levelsTaught?: string[];
  payoutMethod?: string;
  payoutAccount?: string;
  studentLevel?: string;
  studentGrade?: string;
  studentSection?: string;
  institution?: string;
  subjectsOfInterest?: string[];
  acceptedTerms?: boolean;
}): Promise<{
  success: boolean;
  error?: string;
  redirectTo?: string;
  user?: SessionCookiePayload;
}> {
  const cleanEmail = (input.email || '').trim().toLowerCase();
  const cleanName = (input.name || '').trim() || cleanEmail.split('@')[0] || 'Utilisateur 9arrini';
  const normalizedRole: 'USER' | 'SELLER' | 'ADMIN' = isConfiguredAdminEmail(cleanEmail)
    ? 'ADMIN'
    : input.role === 'SELLER' || input.role === 'FREELANCER'
    ? 'SELLER'
    : 'USER';

  if (!cleanEmail || !input.password) {
    return {success: false, error: 'Veuillez renseigner votre email et mot de passe.'};
  }

  if (input.acceptedTerms === false) {
    return {
      success: false,
      error: "Veuillez accepter les Conditions Générales d'Utilisation pour continuer.",
    };
  }

  const pwError = validatePasswordStrength(input.password);
  if (pwError) {
    return {success: false, error: pwError};
  }

  const passwordHash = await hashPassword(input.password);

  const hasTutorApplication = Boolean(
    normalizedRole === 'SELLER' &&
      (input.specialty?.trim() || input.credentials?.trim() || input.bio?.trim())
  );

  const now = new Date().toISOString();
  let userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  let points = 0; // All accounts start at 0 DT / 0 Points

  // 1. Try syncing with Prisma if reachable
  try {
    const existingDbUser = await prisma.user.findUnique({where: {email: cleanEmail}});
    if (existingDbUser) {
      return {
        success: false,
        error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.',
      };
    }
    const created = await prisma.user.create({
      data: {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        emailVerified: true,
        role: normalizedRole,
        points: 0,
        hasPassword: true,
        passwordHash,
        imageSource: 'NULL',
        phone: input.phone?.trim() || null,
        city: input.city?.trim() || null,
        studentLevel: input.studentLevel?.trim() || null,
        studentGrade: input.studentGrade?.trim() || null,
        studentSection: input.studentSection?.trim() || null,
        institution: input.institution?.trim() || null,
        subjectsOfInterest: input.subjectsOfInterest || [],
        acceptedTermsAt: new Date(),
        termsVersion: '2026-10-29',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    userId = created.id;
    points = created.points;

    if (normalizedRole === 'SELLER') {
      await prisma.seller.upsert({
        where: {userId: created.id},
        update: {},
        create: {
          userId: created.id,
          bio: input.bio?.trim() || `Professeur ${cleanName} sur 9arrini`,
          specialty: input.specialty?.trim() || null,
          credentials: input.credentials?.trim() || null,
          experience: input.experience?.trim() || null,
          phone: input.phone?.trim() || null,
          city: input.city?.trim() || null,
          subjects: input.subjects || [],
          levelsTaught: input.levelsTaught || [],
          payoutMethod: input.payoutMethod?.trim() || null,
          payoutAccount: input.payoutAccount?.trim() || null,
          acceptedTutorTermsAt: new Date(),
          isVerified: false,
          verificationStatus: hasTutorApplication ? 'PENDING' : 'UNVERIFIED',
        },
      });
    }
  } catch {
    // Cloud fallback when Postgres is not connected
  }

  // 2. Save in Cloud Store
  try {
    const store = readCloudStore();
    let cloudUser = store.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (cloudUser) {
      return {
        success: false,
        error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.',
      };
    }

    cloudUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      password: passwordHash,
      role: normalizedRole,
      points: 0,
      image: null,
      imageSource: 'NULL',
      hasPassword: true,
      emailVerified: true,
      phone: input.phone?.trim() || null,
      city: input.city?.trim() || null,
      studentLevel: input.studentLevel?.trim() || null,
      studentGrade: input.studentGrade?.trim() || null,
      studentSection: input.studentSection?.trim() || null,
      institution: input.institution?.trim() || null,
      subjectsOfInterest: input.subjectsOfInterest || [],
      acceptedTermsAt: now,
      termsVersion: '2026-10-29',
      createdAt: now,
    };
    store.users.unshift(cloudUser);

    if (normalizedRole === 'SELLER') {
      let existingSeller = store.sellers.find(s => s.userId === userId);
      if (!existingSeller) {
        existingSeller = {
          id: `seller_${userId}`,
          userId,
          bio: input.bio?.trim() || `Professeur ${cleanName} sur 9arrini`,
          specialty: input.specialty?.trim() || undefined,
          credentials: input.credentials?.trim() || undefined,
          experience: input.experience?.trim() || undefined,
          phone: input.phone?.trim() || undefined,
          city: input.city?.trim() || undefined,
          subjects: input.subjects || [],
          levelsTaught: input.levelsTaught || [],
          payoutMethod: input.payoutMethod?.trim() || undefined,
          payoutAccount: input.payoutAccount?.trim() || undefined,
          acceptedTutorTermsAt: now,
          isVerified: false,
          verificationStatus: hasTutorApplication ? 'PENDING' : 'UNVERIFIED',
          createdAt: now,
        };
        store.sellers.unshift(existingSeller);
      } else {
        if (input.specialty?.trim()) existingSeller.specialty = input.specialty.trim();
        if (input.credentials?.trim()) existingSeller.credentials = input.credentials.trim();
        if (input.experience?.trim()) existingSeller.experience = input.experience.trim();
        if (input.phone?.trim()) existingSeller.phone = input.phone.trim();
        if (input.city?.trim()) existingSeller.city = input.city.trim();
        if (input.bio?.trim()) existingSeller.bio = input.bio.trim();
        if (input.subjects?.length) existingSeller.subjects = input.subjects;
        if (input.levelsTaught?.length) existingSeller.levelsTaught = input.levelsTaught;
        if (input.payoutMethod?.trim()) existingSeller.payoutMethod = input.payoutMethod.trim();
        if (input.payoutAccount?.trim()) existingSeller.payoutAccount = input.payoutAccount.trim();
        existingSeller.acceptedTutorTermsAt = now;
        if (hasTutorApplication && !existingSeller.isVerified) {
          existingSeller.verificationStatus = 'PENDING';
        }
      }
      await saveSellerRegistryCookie(existingSeller);
      await saveClientNotificationCookie({
        id: `notif_tutor_welcome_${Date.now()}`,
        userId,
        title: hasTutorApplication
          ? `📋 Candidature Professeur reçue ! Votre dossier est en cours de vérification par l'équipe 9arrini avant l'activation de l'accès complet Professeur.`
          : `👋 Bienvenue dans l'Espace Professeur ! Complétez votre profil complet (photo, bio, diplômes, numéro D17/RIB) pour que l'équipe 9arrini vérifie votre compte.`,
        type: 'AUTOMATED',
        link: '/dashboard/freelancer/account',
        read: false,
        createdAt: now,
      });
    }

    writeCloudStore(store);
  } catch {
    // Ignore fs errors
  }

  const sessionPayload: SessionCookiePayload = {
    userId,
    name: cleanName,
    email: cleanEmail,
    role: normalizedRole,
    points: 0,
    image: null,
    imageSource: 'NULL',
    hasPassword: true,
    passwordHash,
    emailVerified: true,
    phone: input.phone?.trim() || null,
    city: input.city?.trim() || null,
    studentLevel: input.studentLevel?.trim() || null,
    studentGrade: input.studentGrade?.trim() || null,
    studentSection: input.studentSection?.trim() || null,
    institution: input.institution?.trim() || null,
    subjectsOfInterest: input.subjectsOfInterest || [],
    acceptedTermsAt: now,
    createdAt: now,
  };

  await setCloudSessionCookie(sessionPayload);

  return {
    success: true,
    user: sessionPayload,
    redirectTo:
      normalizedRole === 'ADMIN'
        ? '/admin'
        : normalizedRole === 'SELLER'
        ? '/dashboard/freelancer'
        : '/dashboard/client',
  };
}

export async function cloudSignIn(input: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  error?: string;
  redirectTo?: string;
  user?: SessionCookiePayload;
}> {
  const cleanEmail = (input.email || '').trim().toLowerCase();
  if (!cleanEmail || !input.password) {
    return {success: false, error: 'Veuillez entrer votre email et mot de passe.'};
  }

  const now = new Date().toISOString();

  // 1. Check Prisma if reachable
  try {
    const dbUser = await prisma.user.findUnique({where: {email: cleanEmail}});
    if (dbUser) {
      if (dbUser.passwordHash) {
        const valid = await verifyPassword(input.password, dbUser.passwordHash);
        if (!valid) {
          return {success: false, error: 'Email ou mot de passe incorrect.'};
        }
      } else {
        // First password login for legacy DB user: set hash
        const newHash = await hashPassword(input.password);
        await prisma.user.update({
          where: {id: dbUser.id},
          data: {passwordHash: newHash, hasPassword: true},
        });
      }

      const normalizedRole: 'USER' | 'SELLER' | 'ADMIN' =
        dbUser.role === 'ADMIN' || isConfiguredAdminEmail(cleanEmail)
          ? 'ADMIN'
          : dbUser.role === 'SELLER' || dbUser.role === 'FREELANCER'
          ? 'SELLER'
          : 'USER';
      const sessionPayload: SessionCookiePayload = {
        userId: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: normalizedRole,
        points: dbUser.points ?? 0,
        image: dbUser.image,
        imageSource: (dbUser.imageSource as 'NULL' | 'GOOGLE' | 'CLOUDINARY') || 'NULL',
        hasPassword: true,
        passwordHash: dbUser.passwordHash ?? undefined,
        emailVerified: true,
        phone: dbUser.phone ?? null,
        city: dbUser.city ?? null,
        studentLevel: dbUser.studentLevel ?? null,
        studentGrade: dbUser.studentGrade ?? null,
        studentSection: dbUser.studentSection ?? null,
        institution: dbUser.institution ?? null,
        subjectsOfInterest: dbUser.subjectsOfInterest || [],
        acceptedTermsAt: dbUser.acceptedTermsAt ? dbUser.acceptedTermsAt.toISOString() : null,
        createdAt: dbUser.createdAt.toISOString(),
      };
      await setCloudSessionCookie(sessionPayload);
      return {
        success: true,
        user: sessionPayload,
        redirectTo:
          normalizedRole === 'ADMIN'
            ? '/admin'
            : normalizedRole === 'SELLER'
            ? '/dashboard/freelancer'
            : '/dashboard/client',
      };
    }
  } catch {
    // Cloud fallback
  }

  // 2. Check signed backup cookie if user registered on another serverless instance
  let backupAccount: SessionCookiePayload | null = null;
  try {
    const cookieStore = await cookies();
    const rawBackup = cookieStore.get(ACCOUNT_BACKUP_COOKIE)?.value;
    if (rawBackup) {
      const parsed = decodeSession(rawBackup);
      if (parsed && parsed.email.toLowerCase() === cleanEmail) {
        backupAccount = parsed;
      }
    }
  } catch {
    // ignore
  }

  // 3. Check Cloud Store
  const store = readCloudStore();
  let cloudUser = store.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (cloudUser) {
    if (cloudUser.password) {
      const isScryptHash = cloudUser.password.includes(':');
      const isValid = isScryptHash
        ? await verifyPassword(input.password, cloudUser.password)
        : cloudUser.password === input.password;
      if (!isValid) {
        return {success: false, error: 'Email ou mot de passe incorrect.'};
      }
      if (!isScryptHash) {
        cloudUser.password = await hashPassword(input.password);
        writeCloudStore(store);
      }
    }
  } else if (backupAccount) {
    if (backupAccount.passwordHash) {
      const valid = await verifyPassword(input.password, backupAccount.passwordHash);
      if (!valid) {
        return {success: false, error: 'Email ou mot de passe incorrect.'};
      }
    }
    cloudUser = {
      id: backupAccount.userId,
      name: backupAccount.name,
      email: cleanEmail,
      password: backupAccount.passwordHash || (await hashPassword(input.password)),
      role: backupAccount.role,
      points: backupAccount.points ?? 0,
      image: backupAccount.image ?? null,
      imageSource: backupAccount.imageSource || 'NULL',
      hasPassword: true,
      emailVerified: true,
      phone: backupAccount.phone ?? null,
      city: backupAccount.city ?? null,
      studentLevel: backupAccount.studentLevel ?? null,
      studentGrade: backupAccount.studentGrade ?? null,
      studentSection: backupAccount.studentSection ?? null,
      institution: backupAccount.institution ?? null,
      subjectsOfInterest: backupAccount.subjectsOfInterest || [],
      acceptedTermsAt: backupAccount.acceptedTermsAt ?? null,
      createdAt: backupAccount.createdAt || now,
    };
    store.users.unshift(cloudUser);
    writeCloudStore(store);
  } else {
    return {
      success: false,
      error: 'Aucun compte trouvé avec cet email. Veuillez créer un compte d’abord.',
    };
  }

  const normalizedRole: 'USER' | 'SELLER' | 'ADMIN' =
    cloudUser.role === 'ADMIN' || isConfiguredAdminEmail(cleanEmail)
      ? 'ADMIN'
      : cloudUser.role === 'SELLER' || cloudUser.role === 'FREELANCER'
      ? 'SELLER'
      : 'USER';

  const sessionPayload: SessionCookiePayload = {
    userId: cloudUser.id,
    name: cloudUser.name,
    email: cloudUser.email,
    role: normalizedRole,
    points: cloudUser.points ?? 0,
    image: cloudUser.image ?? null,
    imageSource: cloudUser.imageSource || 'NULL',
    hasPassword: true,
    passwordHash: cloudUser.password,
    emailVerified: true,
    phone: cloudUser.phone ?? null,
    city: cloudUser.city ?? null,
    studentLevel: cloudUser.studentLevel ?? null,
    studentGrade: cloudUser.studentGrade ?? null,
    studentSection: cloudUser.studentSection ?? null,
    institution: cloudUser.institution ?? null,
    subjectsOfInterest: cloudUser.subjectsOfInterest || [],
    acceptedTermsAt: cloudUser.acceptedTermsAt ?? null,
    createdAt: cloudUser.createdAt || now,
  };

  await setCloudSessionCookie(sessionPayload);

  return {
    success: true,
    user: sessionPayload,
    redirectTo:
      normalizedRole === 'ADMIN'
        ? '/admin'
        : normalizedRole === 'SELLER'
        ? '/dashboard/freelancer'
        : '/dashboard/client',
  };
}

export async function cloudGoogleSignIn(input: {
  email: string;
  name?: string;
  role?: 'USER' | 'SELLER' | 'FREELANCER';
  image?: string | null;
}): Promise<{
  success: boolean;
  error?: string;
  redirectTo?: string;
  user?: SessionCookiePayload;
}> {
  const cleanEmail = (input.email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {success: false, error: 'Veuillez entrer une adresse Google (@gmail.com) valide.'};
  }

  const derivedName =
    (input.name || '').trim() ||
    cleanEmail
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()) ||
    'Utilisateur Google';

  const now = new Date().toISOString();
  const store = readCloudStore();
  let cloudUser = store.users.find(u => u.email.toLowerCase() === cleanEmail);

  const requestedRole: 'USER' | 'SELLER' | 'ADMIN' =
    input.role === 'SELLER' || input.role === 'FREELANCER'
      ? 'SELLER'
      : input.role === 'USER'
      ? 'USER'
      : isConfiguredAdminEmail(cleanEmail)
      ? 'ADMIN'
      : cloudUser?.role === 'SELLER' || cloudUser?.role === 'FREELANCER'
      ? 'SELLER'
      : 'USER';

  const actualGoogleImage = input.image || null;
  const avatarUrl =
    actualGoogleImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      derivedName
    )}&background=059669&color=fff&bold=true`;

  if (!cloudUser) {
    cloudUser = {
      id: `usr_google_${Date.now().toString(36)}`,
      name: derivedName,
      email: cleanEmail,
      role: requestedRole,
      points: 0,
      image: actualGoogleImage || avatarUrl,
      imageSource: 'GOOGLE',
      hasPassword: false,
      emailVerified: true,
      acceptedTermsAt: now,
      createdAt: now,
    };
    store.users.unshift(cloudUser);
  } else {
    if (input.name && input.name.trim()) {
      cloudUser.name = input.name.trim();
    }
    if (input.role || isConfiguredAdminEmail(cleanEmail)) {
      cloudUser.role = requestedRole;
    }
    if (actualGoogleImage) {
      cloudUser.image = actualGoogleImage;
    } else {
      cloudUser.image = cloudUser.image || avatarUrl;
    }
    cloudUser.imageSource = 'GOOGLE';
  }

  if (requestedRole === 'SELLER') {
    const cookieSellers = await getSellersRegistryCookie();
    const cookieSeller = cookieSellers.find(s => s.userId === cloudUser!.id);
    let existingSeller = store.sellers.find(s => s.userId === cloudUser!.id) || cookieSeller;
    if (!existingSeller) {
      existingSeller = {
        id: `seller_${cloudUser.id}`,
        userId: cloudUser.id,
        bio: '',
        isVerified: false,
        verificationStatus: 'UNVERIFIED',
        createdAt: now,
      };
      store.sellers.unshift(existingSeller);
    }
    await saveSellerRegistryCookie(existingSeller);
  }

  writeCloudStore(store);

  const sessionPayload: SessionCookiePayload = {
    userId: cloudUser.id,
    name: cloudUser.name,
    email: cloudUser.email,
    role: requestedRole,
    points: cloudUser.points ?? 0,
    image: actualGoogleImage || cloudUser.image || avatarUrl,
    imageSource: 'GOOGLE',
    hasPassword: cloudUser.hasPassword ?? false,
    emailVerified: true,
    phone: cloudUser.phone ?? null,
    city: cloudUser.city ?? null,
    studentLevel: cloudUser.studentLevel ?? null,
    studentGrade: cloudUser.studentGrade ?? null,
    studentSection: cloudUser.studentSection ?? null,
    institution: cloudUser.institution ?? null,
    subjectsOfInterest: cloudUser.subjectsOfInterest || [],
    acceptedTermsAt: cloudUser.acceptedTermsAt ?? now,
    createdAt: cloudUser.createdAt || now,
  };

  await setCloudSessionCookie(sessionPayload);

  return {
    success: true,
    user: sessionPayload,
    redirectTo:
      requestedRole === 'ADMIN'
        ? '/admin'
        : requestedRole === 'SELLER'
        ? '/dashboard/freelancer'
        : '/dashboard/client',
  };
}
