import app from '../src/server.js';
import { initializeDatabase } from '../src/database/connection.js';

// Ensure database initialization begins on serverless cold start
initializeDatabase().catch(err => {
  console.warn('[Vercel Serverless] DB initialization warning:', err.message);
});

export default app;
