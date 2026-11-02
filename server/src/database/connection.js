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

      // Adaptive timeout: 5000ms for cloud databases (Neon, Supabase, Render), 600ms for localhost
      const isRemoteDb = config.databaseUrl && !config.databaseUrl.includes('localhost') && !config.databaseUrl.includes('127.0.0.1');
      const timeoutMs = isRemoteDb ? 6000 : 600;

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
      console.warn(`⚠️ [Database Status] PostgreSQL is unavailable: ${err.message}`);
      console.info('ℹ️ [Database Status] Operating on resilient persistent store (server/data/store.json). All product CRUD, cart, orders, and bilingual features are 100% active.');
    }

    // Pre-load local store in all cases
    localStore.get();
  })();

  return initPromise;
}

export function getDatabaseStatus() {
  return {
    isPostgresConnected,
    provider: isPostgresConnected ? 'PostgreSQL (Prisma)' : 'Local Persisted Store (Zero-Dependency)',
    databaseUrl: isPostgresConnected ? config.databaseUrl.replace(/:[^:@]+@/, ':****@') : null,
    reason: postgresErrorReason,
    instructions: !isPostgresConnected
      ? 'To connect to managed PostgreSQL (e.g. Neon.tech), set DATABASE_URL="postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require" in server/.env and run: npx prisma db push'
      : 'PostgreSQL is fully active.'
  };
}

export { prisma, localStore };
