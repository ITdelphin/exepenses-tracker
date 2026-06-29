import { PrismaClient } from '@prisma/client';

let databaseUrl = process.env.DATABASE_URL;

if (databaseUrl && databaseUrl.includes('pooler.supabase.com')) {
  if (databaseUrl.includes(':5432/')) {
    databaseUrl = databaseUrl.replace(':5432/', ':6543/');
  }
  if (!databaseUrl.includes('pgbouncer=true')) {
    databaseUrl += (databaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
