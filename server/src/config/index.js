import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mahadev_electro_hub?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'mahadev_electro_hub_default_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@mahadevelectrohub.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@Mahadev2026',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  // Email Notifications Configuration
  businessNotificationEmail: process.env.BUSINESS_NOTIFICATION_EMAIL || 'mahadevelectohub@gmail.com',
  mailFrom: process.env.MAIL_FROM || 'Mahadev Electro Hub <notifications@mahadevelectrohub.com>',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
};
