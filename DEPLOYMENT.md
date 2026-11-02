# DEPLOYMENT GUIDE: MAHADEV ELECTRO HUB

This document outlines the step-by-step procedure for deploying **Mahadev Electro Hub** to production.

---

## Architecture Overview

```
                      ┌──────────────────────────┐
                      │      Vercel / Netlify    │
                      │  React + Vite Frontend   │
                      │  (mahadevelectohub.com)  │
                      └─────────────┬────────────┘
                                    │ HTTPS API calls
                                    ▼
                      ┌──────────────────────────┐
                      │    Node.js / Express     │
                      │  (Render / Railway / VPS)│
                      │      REST API Backend    │
                      └─────────────┬────────────┘
                                    │ Prisma ORM
                                    ▼
                      ┌──────────────────────────┐
                      │    Managed PostgreSQL    │
                      │  (Neon.tech / Supabase)  │
                      └──────────────────────────┘
```

---

## 1. Managed PostgreSQL Database Setup (Recommended: Neon.tech)

1. Create a free managed PostgreSQL cluster at [https://neon.tech](https://neon.tech).
2. Copy the pooled connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-sample-12345.ap-southeast-1.aws.neon.tech/mahadev_db?sslmode=require"
   ```
3. Run the schema push to initialize tables:
   ```bash
   cd server
   npx prisma db push
   ```

---

## 2. Backend Deployment (Render or Railway)

### Using Render:
1. Push your repository to GitHub.
2. In Render Dashboard, click **New +** -> **Web Service**.
3. Select your repository and specify:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `node src/server.js`
4. In **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://...
   JWT_SECRET=your_long_random_production_secret_key
   JWT_EXPIRES_IN=7d
   ADMIN_EMAIL=admin@mahadevelectrohub.com
   ADMIN_PASSWORD=YourStrongPasswordHere
   CLIENT_ORIGIN=https://mahadevelectohub.com
   ```
5. Deploy service and copy your public backend URL (e.g. `https://mahadev-api.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

1. In Vercel Dashboard, click **Add New...** -> **Project**.
2. Select your repository.
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, configure:
   ```env
   VITE_API_URL=https://mahadev-api.onrender.com/api
   VITE_SITE_URL=https://mahadevelectohub.com
   VITE_BUSINESS_NAME="Mahadev Electro Hub"
   VITE_LOCATION="Pali, Rajasthan, India"
   VITE_PHONE="+91 98765 43210"
   VITE_EMAIL="contact@mahadevelectrohub.com"
   ```
5. Deploy.
6. Connect custom domain `mahadevelectohub.com` in Vercel Domain Settings.

---

## 4. Production Image Storage (Cloudinary)

For production deployments where server filesystems are ephemeral (like Render/Heroku):
1. Create a free account at [Cloudinary.com](https://cloudinary.com).
2. Add your keys to the backend environment:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. Multer can be switched to `multer-storage-cloudinary` for cloud persistence.
