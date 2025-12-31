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
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      imageSource: {
        type: 'string',
        default: 'NULL',
        required: true,
        returned: true,
        input: true,
      },
      hasPassword: {
        type: 'boolean',
        required: true,
        default: false,
        returned: true,
        input: true,
      },
      role: {
        type: 'string',
        required: true,
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
          return {data: {...user, hasPassword: false}};
        },
      },
    },
  },

  socialProviders: {
    google: {
      enabled: true,
      prompt: 'select_account consent',
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: env.GOOGLE_REDIRECT_URI || '',
    },
  },
});

// const ac = accessControll
