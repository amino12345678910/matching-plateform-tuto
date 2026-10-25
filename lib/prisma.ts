import {PrismaClient} from '@/generated/prisma';

const globalForPrisma = global as unknown as {prisma: PrismaClient};

const rawUrl = process.env.DATABASE_URL || '';
const isLocalDbUrl =
  !rawUrl || rawUrl.includes('127.0.0.1') || rawUrl.includes('localhost');
const isServerlessWithoutRemoteDb =
  !rawUrl ||
  ((process.env.NODE_ENV === 'production' ||
    Boolean(process.env.NETLIFY) ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)) &&
    isLocalDbUrl);

function createFastFallbackPrisma(): PrismaClient {
  const rejectInstant = () =>
    Promise.reject(new Error('Cloud fallback mode: no remote PostgreSQL configured'));

  const modelProxy = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') return undefined;
        return rejectInstant;
      },
    }
  );

  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') return undefined;
        if (prop === '$connect' || prop === '$disconnect') {
          return () => Promise.resolve();
        }
        if (typeof prop === 'string' && prop.startsWith('$')) {
          return rejectInstant;
        }
        return modelProxy;
      },
    }
  ) as unknown as PrismaClient;
}

export const prisma: PrismaClient = isServerlessWithoutRemoteDb
  ? createFastFallbackPrisma()
  : globalForPrisma.prisma ||
    new PrismaClient({
      datasources: {
        db: {
          url: rawUrl,
        },
      },
    });

if (process.env.NODE_ENV !== 'production' && !isServerlessWithoutRemoteDb) {
  globalForPrisma.prisma = prisma;
}
