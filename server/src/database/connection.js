import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';
import { localStore } from './store.js';

let prisma = null;
let isPostgresConnected = false;
let postgresErrorReason = 'PostgreSQL service not connected or DATABASE_URL unreachable.';

// Test PostgreSQL connection
export async function initializeDatabase() {
  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.databaseUrl,
        },
      },
    });

    // Test a basic query with timeout (fast 400ms fallback if PostgreSQL is not running locally)
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout to PostgreSQL (5432)')), 400))
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
