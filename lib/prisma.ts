import {PrismaClient} from '@/generated/prisma';

const globalForPrisma = global as unknown as {prisma: PrismaClient};

const dbUrl =
  process.env.DATABASE_URL ||
  'postgres://postgres:postgres@127.0.0.1:5432/template1?sslmode=disable&pgbouncer=true&connection_limit=1&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0';

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl.includes('pgbouncer=true')
          ? dbUrl
          : `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}pgbouncer=true&connection_limit=1`,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
