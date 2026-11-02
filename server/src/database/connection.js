import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';
import { localStore } from './store.js';

let prisma = null;
let isPostgresConnected = false;
let postgresErrorReason = 'PostgreSQL service not connected or DATABASE_URL unreachable.';
let initPromise = null;

// Test PostgreSQL connection
export async function initializeDatabase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: config.databaseUrl,
          },
        },
      });

      // Adaptive timeout: 15000ms for cloud databases (Neon, Supabase, Render), 600ms for localhost
      const isRemoteDb = config.databaseUrl && !config.databaseUrl.includes('localhost') && !config.databaseUrl.includes('127.0.0.1');
      const timeoutMs = isRemoteDb ? 15000 : 600;

      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Connection timeout to PostgreSQL (${timeoutMs}ms)`)), timeoutMs))
      ]);

      isPostgresConnected = true;
      postgresErrorReason = null;
      console.log('✅ [Database] Successfully connected to PostgreSQL via Prisma ORM.');
    } catch (err) {
      isPostgresConnected = false;
      postgresErrorReason = err.message;
      initPromise = null; // Reset promise so next request can retry
      if (config.nodeEnv === 'production') {
        console.error(`🚨 [CRITICAL DATABASE ERROR - PRODUCTION] PostgreSQL is unreachable: ${err.message}`);
        console.error('🚨 Production mode strictly requires Neon PostgreSQL. Running on local JSON in production is NOT permitted.');
      } else {
        console.warn(`⚠️ [Database Status] PostgreSQL is unavailable: ${err.message}`);
        console.info('ℹ️ [Database Status] Development mode: operating on resilient persistent store (server/data/store.json).');
      }
    }

    // Pre-load local store
    localStore.get();
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
      : (isProd ? 'ERROR: PostgreSQL Offline in Production' : 'Local Persisted Store (Development Fallback)'),
    databaseUrl: isPostgresConnected ? config.databaseUrl.replace(/:[^:@]+@/, ':****@') : null,
    reason: postgresErrorReason,
    productionDatabaseEnforced: isProd,
    instructions: !isPostgresConnected
      ? 'To connect to managed PostgreSQL (e.g. Neon.tech), configure DATABASE_URL="postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require" in server/.env and in production hosting environment variables.'
      : 'PostgreSQL is fully active.'
  };
}

export { prisma, localStore };
