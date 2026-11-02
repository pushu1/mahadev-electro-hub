import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { initializeDatabase, getDatabaseStatus } from './database/connection.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reelRoutes from './routes/reelRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares - Robust CORS supporting browser credentials, Vercel preview domains & production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  config.clientOrigin,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('mahadev') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure database is initialized before handling requests (crucial for serverless cold-starts)
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
  } catch (err) {
    // Handled by connection diagnostics
  }
  next();
});

// Static uploads folder
const uploadsPath = path.join(__dirname, '../public/uploads');
app.use('/uploads', express.static(uploadsPath));

// Root & API Base Endpoint - Fixes "Cannot GET /api"
app.get(['/', '/api'], async (req, res) => {
  await initializeDatabase();
  const dbStatus = getDatabaseStatus();
  res.json({
    name: 'Mahadev Electro Hub REST API',
    status: 'ONLINE',
    version: '1.0.0',
    business: 'Mahadev Electro Hub',
    location: 'Pali, Rajasthan, India',
    businessWebsite: 'https://mahadevelectohub.com',
    endpoints: {
      health: '/api/health',
      categories: '/api/categories',
      products: '/api/products',
      orders: '/api/orders',
      cms: '/api/cms',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      reels: '/api/reels',
      uploads: '/api/uploads',
    },
    database: {
      provider: dbStatus.provider,
      isPostgresConnected: dbStatus.isPostgresConnected,
      status: dbStatus.isPostgresConnected ? 'Connected to PostgreSQL' : 'Active on Resilient Local Store'
    },
    timestamp: new Date().toISOString()
  });
});

// Health & Database Diagnostics Endpoint
app.get('/api/health', async (req, res) => {
  await initializeDatabase();
  const dbStatus = getDatabaseStatus();
  const isHealthy = config.nodeEnv !== 'production' || dbStatus.isPostgresConnected;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ONLINE' : 'DEGRADED_DATABASE_UNAVAILABLE',
    business: 'Mahadev Electro Hub',
    location: 'Pali, Rajasthan, India',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/newsletter', cmsRoutes);
app.use('/api/contact', cmsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/admin/reels', reelRoutes);

// 404 Route handler for unrecognized API paths
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route ${req.method} ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Uncaught Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server (Direct execution mode)
async function startServer() {
  await initializeDatabase();

  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`⚡ MAHADEV ELECTRO HUB API SERVER RUNNING ON PORT ${config.port}`);
    console.log(`🌐 Base URL: http://localhost:${config.port}/api`);
    console.log(`📁 Uploads: http://localhost:${config.port}/uploads`);
    console.log(`=======================================================`);
  });
}

// Automatically start listener when run directly (local node execution)
if (!process.env.VERCEL) {
  startServer();
}

// Export for serverless runtime (Vercel)
export default app;
