'use server';

import {cookies} from 'next/headers';
import {prisma} from '@/lib/prisma';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
import {
  saveSellerRegistryCookie,
  saveClientNotificationCookie,
  getSellersRegistryCookie,
} from '@/hooks/book/bookings-store';

const SESSION_COOKIE_NAME = '9arrini_user_session';
const ACCOUNT_BACKUP_COOKIE = '9arrini_account_backup';

export interface SessionCookiePayload {
  userId: string;
  name: string;
  email: string;
  role: 'USER' | 'FREELANCER' | 'SELLER' | 'ADMIN';
  points: number;
  image?: string | null;
  imageSource: 'NULL' | 'GOOGLE' | 'CLOUDINARY';
  hasPassword: boolean;
  emailVerified: boolean;
  createdAt: string;
}

function encodeSession(payload: SessionCookiePayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
}

function decodeSession(raw: string): SessionCookiePayload | null {
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf-8');
    return JSON.parse(json);
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

    const normalizedRole =
      session.role === 'SELLER' || session.role === 'FREELANCER' ? 'SELLER' : session.role || 'USER';
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
          role: normalizedRole,
          points: session.points ?? 50,
          image: session.image ?? null,
          imageSource: session.imageSource || 'NULL',
          hasPassword: true,
          emailVerified: true,
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

export async function setCloudSessionCookie(payload: SessionCookiePayload) {
  try {
    const cookieStore = await cookies();
    const encoded = encodeSession(payload);
    const cookieOpts = {
      httpOnly: true,
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
  bio?: string;
}): Promise<{
  success: boolean;
  error?: string;
  redirectTo?: string;
  user?: SessionCookiePayload;
}> {
  const cleanEmail = (input.email || '').trim().toLowerCase();
  const cleanName = (input.name || '').trim() || cleanEmail.split('@')[0] || 'Utilisateur 9arrini';
  const normalizedRole: 'USER' | 'SELLER' =
    input.role === 'SELLER' || input.role === 'FREELANCER' ? 'SELLER' : 'USER';

  if (!cleanEmail || !input.password) {
    return {success: false, error: 'Veuillez renseigner votre email et mot de passe.'};
  }

  const hasTutorApplication = Boolean(
    normalizedRole === 'SELLER' &&
      (input.specialty?.trim() || input.credentials?.trim() || input.bio?.trim())
  );

  const now = new Date().toISOString();
  let userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  let points = 50; // 50 Points (50 DT) welcome balance

  // 1. Try syncing with Prisma if reachable
  try {
    const existingDbUser = await prisma.user.findUnique({where: {email: cleanEmail}});
    if (existingDbUser) {
      userId = existingDbUser.id;
      points = existingDbUser.points || 50;
    } else {
      const created = await prisma.user.create({
        data: {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          emailVerified: true,
          role: normalizedRole,
          points: 50,
          hasPassword: true,
          imageSource: 'NULL',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      userId = created.id;
      points = created.points;

      await prisma.pointTransaction.create({
        data: {
          userId: created.id,
          amount: 50,
          type: 'BONUS',
          description: 'Solde de bienvenue 9arrini (50 Points = 50 DT)',
        },
      });

      if (normalizedRole === 'SELLER') {
        await prisma.seller.upsert({
          where: {userId: created.id},
          update: {},
          create: {
            userId: created.id,
            bio: `Professeur ${cleanName} sur 9arrini`,
            isVerified: false,
            verificationStatus: 'PENDING',
          },
        });
      }
    }
  } catch {
    // Cloud fallback when local Postgres is not connected on Netlify
  }

  // 2. Save in Cloud Store
  try {
    const store = readCloudStore();
    let cloudUser = store.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!cloudUser) {
      cloudUser = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        password: input.password,
        role: normalizedRole,
        points,
        image: null,
        imageSource: 'NULL',
        hasPassword: true,
        emailVerified: true,
        createdAt: now,
      };
      store.users.unshift(cloudUser);
      store.transactions.unshift({
        id: `tx_${Date.now()}`,
        userId: cloudUser.id,
        amount: 50,
        type: 'BONUS',
        description: 'Solde de bienvenue 9arrini (50 Points = 50 DT)',
        createdAt: now,
      });
    } else {
      cloudUser.name = cleanName;
      cloudUser.role = normalizedRole;
      userId = cloudUser.id;
      points = cloudUser.points;
    }

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
        if (input.bio?.trim()) existingSeller.bio = input.bio.trim();
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
          : `👋 Bienvenue dans l'Espace Professeur ! Complétez votre dossier de candidature pour que l'équipe 9arrini vérifie votre compte et débloque l'accès complet.`,
        type: 'AUTOMATED',
        link: '/dashboard/freelancer',
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
    points,
    image: null,
    imageSource: 'NULL',
    hasPassword: true,
    emailVerified: true,
    createdAt: now,
  };

  await setCloudSessionCookie(sessionPayload);

  return {
    success: true,
    user: sessionPayload,
    redirectTo: normalizedRole === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client',
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
      const normalizedRole: 'USER' | 'SELLER' =
        dbUser.role === 'SELLER' || dbUser.role === 'FREELANCER' ? 'SELLER' : 'USER';
      const sessionPayload: SessionCookiePayload = {
        userId: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: normalizedRole,
        points: dbUser.points ?? 50,
        image: dbUser.image,
        imageSource: (dbUser.imageSource as any) || 'NULL',
        hasPassword: true,
        emailVerified: true,
        createdAt: dbUser.createdAt.toISOString(),
      };
      await setCloudSessionCookie(sessionPayload);
      return {
        success: true,
        user: sessionPayload,
        redirectTo: normalizedRole === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client',
      };
    }
  } catch {
    // Cloud fallback
  }

  // 2. Check backup cookie if user previously registered on another serverless instance
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

  // 3. Check Cloud Store (or auto-provision on Netlify so user can always connect)
  const store = readCloudStore();
  let cloudUser = store.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (cloudUser && cloudUser.password && cloudUser.password !== input.password) {
    return {success: false, error: 'Mot de passe incorrect.'};
  }

  if (!cloudUser) {
    const derivedName =
      backupAccount?.name ||
      cleanEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()) ||
      'Élève 9arrini';
    const derivedRole: 'USER' | 'SELLER' =
      backupAccount?.role === 'SELLER' || backupAccount?.role === 'FREELANCER' ? 'SELLER' : 'USER';
    const derivedPoints = backupAccount?.points ?? 50;

    cloudUser = {
      id: backupAccount?.userId || `usr_${Date.now().toString(36)}`,
      name: derivedName,
      email: cleanEmail,
      password: input.password,
      role: derivedRole,
      points: derivedPoints,
      image: backupAccount?.image ?? null,
      imageSource: backupAccount?.imageSource || 'NULL',
      hasPassword: true,
      emailVerified: true,
      createdAt: backupAccount?.createdAt || now,
    };
    store.users.unshift(cloudUser);
    store.transactions.unshift({
      id: `tx_${Date.now()}`,
      userId: cloudUser.id,
      amount: derivedPoints,
      type: 'BONUS',
      description: 'Solde de bienvenue 9arrini (50 Points = 50 DT)',
      createdAt: now,
    });
    if (derivedRole === 'SELLER') {
      store.sellers.unshift({
        id: `seller_${cloudUser.id}`,
        userId: cloudUser.id,
        bio: `Professeur ${derivedName} sur 9arrini`,
        isVerified: false,
        verificationStatus: 'PENDING',
        createdAt: now,
      });
    }
    writeCloudStore(store);
  }

  const normalizedRole: 'USER' | 'SELLER' =
    cloudUser.role === 'SELLER' || cloudUser.role === 'FREELANCER' ? 'SELLER' : 'USER';

  const sessionPayload: SessionCookiePayload = {
    userId: cloudUser.id,
    name: cloudUser.name,
    email: cloudUser.email,
    role: normalizedRole,
    points: cloudUser.points ?? 50,
    image: cloudUser.image ?? null,
    imageSource: cloudUser.imageSource || 'NULL',
    hasPassword: true,
    emailVerified: true,
    createdAt: cloudUser.createdAt || now,
  };

  await setCloudSessionCookie(sessionPayload);

  return {
    success: true,
    user: sessionPayload,
    redirectTo: normalizedRole === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client',
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

  const requestedRole: 'USER' | 'SELLER' =
    input.role === 'SELLER' || input.role === 'FREELANCER'
      ? 'SELLER'
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
      points: 50,
      image: actualGoogleImage || avatarUrl,
      imageSource: 'GOOGLE',
      hasPassword: false,
      emailVerified: true,
      createdAt: now,
    };
    store.users.unshift(cloudUser);
    store.transactions.unshift({
      id: `tx_google_${Date.now()}`,
      userId: cloudUser.id,
      amount: 50,
      type: 'BONUS',
      description: 'Solde de bienvenue Google 9arrini (50 Points = 50 DT)',
      createdAt: now,
    });
  } else {
    if (input.name && input.name.trim()) {
      cloudUser.name = input.name.trim();
    }
    if (input.role) {
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
    points: cloudUser.points ?? 50,
    image: actualGoogleImage || cloudUser.image || avatarUrl,
    imageSource: 'GOOGLE',
    hasPassword: cloudUser.hasPassword ?? false,
    emailVerified: true,
    createdAt: cloudUser.createdAt || now,
  };

  await setCloudSessionCookie(sessionPayload);

  return {
    success: true,
    user: sessionPayload,
    redirectTo: requestedRole === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client',
  };
}

