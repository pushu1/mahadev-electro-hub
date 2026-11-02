import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';

// Serverless-safe Prisma Client Singleton
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
  log: ['error'],
});

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

let isPostgresConnected = false;
let postgresErrorReason = 'PostgreSQL service not tested yet.';
let initPromise = null;

// Test PostgreSQL connection
export async function initializeDatabase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const isRemoteDb = config.databaseUrl && !config.databaseUrl.includes('localhost') && !config.databaseUrl.includes('127.0.0.1');
      const timeoutMs = isRemoteDb ? 15000 : 2000;

      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Connection timeout to PostgreSQL (${timeoutMs}ms)`)), timeoutMs))
      ]);

      isPostgresConnected = true;
      postgresErrorReason = null;
      console.log('✅ [Database] Verified persistent connection to Neon PostgreSQL via Prisma ORM.');
    } catch (err) {
      isPostgresConnected = false;
      postgresErrorReason = err.message;
      initPromise = null; // Reset promise so next request can retry
      if (config.nodeEnv === 'production') {
        console.error(`🚨 [CRITICAL DATABASE ERROR - PRODUCTION] PostgreSQL is unreachable: ${err.message}`);
      } else {
        console.warn(`⚠️ [Database Status] PostgreSQL is unavailable: ${err.message}`);
      }
    }
  })();

  return initPromise;
}

export function getDatabaseStatus() {
  const isProd = config.nodeEnv === 'production';
  return {
    isPostgresConnected,
    mode: config.nodeEnv,
    provider: isPostgresConnected 
      ? 'PostgreSQL (Prisma)' 
      : (isProd ? 'ERROR: PostgreSQL Offline in Production' : 'Local Fallback'),
    databaseUrl: isPostgresConnected ? config.databaseUrl.replace(/:[^:@]+@/, ':****@') : null,
    reason: postgresErrorReason,
    productionDatabaseEnforced: isProd,
    instructions: !isPostgresConnected
      ? 'Configure DATABASE_URL="postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require" in server/.env and production environment variables.'
      : 'Neon PostgreSQL is fully active and persistent.'
  };
}

export { isPostgresConnected };
