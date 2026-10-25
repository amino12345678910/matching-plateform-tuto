import {betterAuth} from 'better-auth';
import {env} from 'process';
import {prismaAdapter} from 'better-auth/adapters/prisma';
import {prisma} from './prisma';
// import type {role} from 'better-auth/plugins/access';
// import {PrismaClient} from '@src/generated/prisma/client';
// import {PrismaPg} from '@prisma/adapter-pg';
// const adapter = new PrismaPg({connectionString: env.DATABASE_URL});
// const prisma = new PrismaClient();
export type ImageSource = 'GOOGLE' | 'CLOUDINARY' | 'NULL';

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    '9arrini-default-production-secret-key-2026-tunisia',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://*.netlify.app',
    'https://*.vercel.app',
  ],
  user: {
    additionalFields: {
      imageSource: {
        type: 'string',
        default: 'NULL',
        required: false,
        returned: true,
        input: true,
      },
      hasPassword: {
        type: 'boolean',
        required: false,
        default: true,
        returned: true,
        input: true,
      },
      role: {
        type: 'string',
        required: false,
        default: 'USER',
        returned: true,
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },

  databaseHooks: {
    user: {
      create: {
        before: async user => {
          const validSources = ['GOOGLE', 'CLOUDINARY', 'NULL'];
          const safeImageSource = validSources.includes(user.imageSource as string)
            ? user.imageSource
            : 'NULL';
          return {
            data: {
              ...user,
              role: user.role || 'USER',
              imageSource: safeImageSource,
              hasPassword: user.hasPassword ?? true,
            },
          };
        },
        after: async user => {
          if (user.role === 'SELLER') {
            try {
              await prisma.seller.upsert({
                where: {userId: user.id},
                update: {},
                create: {userId: user.id},
              });
            } catch (e) {
              console.error('Error creating tutor profile:', e);
            }
          }
        },
      },
    },
  },

  socialProviders: {
    google: {
      enabled: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      prompt: 'select_account consent',
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: env.GOOGLE_REDIRECT_URI || '',
    },
  },
});

// const ac = accessControll
