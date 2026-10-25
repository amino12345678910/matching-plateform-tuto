import {PrismaClient} from '@/generated/prisma';

const globalForPrisma = globalThis as unknown as {prisma?: PrismaClient};

const dbUrl = process.env.DATABASE_URL || '';
const isLocalDbUrl =
  !dbUrl || dbUrl.includes('127.0.0.1') || dbUrl.includes('localhost');
const isServerlessCloud = Boolean(process.env.VERCEL || process.env.NETLIFY);

function createFastFailProxy(): PrismaClient {
  const rejectOp = () =>
    Promise.reject(
      new Error(
        'Remote DATABASE_URL is not configured in this serverless environment.'
      )
    );
  const modelProxy = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') return undefined;
        return rejectOp;
      },
    }
  );
  return new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      if (prop === '$transaction' || prop === '$connect' || prop === '$disconnect') {
        return rejectOp;
      }
      return modelProxy;
    },
  });
}

export const prisma: PrismaClient =
  isServerlessCloud && isLocalDbUrl
    ? createFastFailProxy()
    : (globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      }));

if (process.env.NODE_ENV !== 'production' && !(isServerlessCloud && isLocalDbUrl)) {
  globalForPrisma.prisma = prisma;
}
