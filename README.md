# MAHADEV ELECTRO HUB (महादेव इलेक्ट्रो हब)
## Complete Bilingual E-Commerce Store & Real-Time Admin CMS

Official Business Website: [https://mahadevelectohub.com](https://mahadevelectohub.com)  
Location: **Main Market, Pali, Rajasthan, India - 306401**  
Helpline: **+91 98765 43210**

---

## ⚡ Overview

Mahadev Electro Hub is a production-ready, full-stack bilingual e-commerce platform built specifically for an electrical and solar products business based in Pali, Rajasthan.

The platform provides a consumer storefront and an intuitive Admin Content Management System (CMS) designed for non-technical shop owners.

---

## 🌟 Key Features

1. **Brand Identity & Design System**:
   - Official metallic gold and black monogram logo (`/images/logo.png`) based on the provided emblem.
   - Luxury brand palette: Primary Black (`#080808`), Dark Charcoal (`#171717`), Antique Gold (`#D6A52A`), Golden Orange (`#F5A623`), Light Background (`#F7F7F5`).
   - Clean Devanagari font rendering (*Noto Sans Devanagari*) alongside *Inter* & *Poppins*.

2. **Full Bilingual Architecture (English & हिंदी)**:
   - Instant language switcher in the header and mobile drawer.
   - Separate database entries for English and Hindi titles, descriptions, key features, and safety instructions.
   - Fallback protection: if content in one language is missing, the alternate is seamlessly shown without blank screens.
   - Persistent language selection stored in `localStorage`.

3. **8 Electrical Product Categories & Subcategories**:
   - **Torches (टॉर्च)**: Farming, Security, Hunting, Zooming Metal.
   - **Zatka Machines (झटका मशीन)**: 2 KM & 5 KM Fencing Power (advertised test ratings with agricultural safety warnings).
   - **Solar Street Lights (सोलर स्ट्रीट लाइट)**: Home, Factory, Farmhouse, Warehouse all-in-one dusk-to-dawn sensors.
   - **Headlamps (हेडलैंप)**: Farming hands-free, Forest, Tracking.
   - **Small Pocket Torches (छोटी पॉकेट टॉर्च)**: Travelling, Factory, Warehouse, Home, Tours.
   - **Rechargeable Fans (रिचार्जेबल पंखे)**: Table & portable home fans.
   - **Bike Lights (बाइक लाइट)**: Two-wheeler auxiliary LED fog lights.
   - **Solar DC Products (सोलर डीसी प्रोडक्ट्स)**: 12V DC Fans, Bulbs, Foxlight Converters, DC Motors.

4. **Real-Time Admin CMS (`/admin`)**:
   - **Dashboard**: Live database revenue, orders today, pending COD, active products, low-stock alerts, top-selling items.
   - **Product Management**: Add, edit, delete, live stock adjustments, bilingual tabs, and direct image upload from your computer via Multer.
   - **Category Management**: Edit English & Hindi names, reorder, create subcategories, toggle navigation visibility, safe deletion checks.
   - **Order Fulfillment**: Review orders, customer delivery address in Rajasthan/India, update statuses (*Pending -> Confirmed -> Processing -> Shipped -> Delivered*).
   - **Inventory Control**: Fast inline stock adjustments with low-stock warnings.
   - **CMS & Marketing**: Customizable Announcement bar (colors, text EN/HI, links), Hero Banners, Discount Coupons (`MAHADEV50`, `KISAN10`), Customer Review Moderation, Store Settings.

5. **Cart, Checkout & Tracking**:
   - Live backend price and stock validation (preventing tampered prices or ordering beyond stock).
   - Automatic free shipping threshold (orders above ₹1,000).
   - Interactive order tracking timeline for customers.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router 6, Tailwind CSS, Lucide React Icons.
- **Backend**: Node.js, Express.js REST API, Multer (direct computer uploads), JWT authentication, bcrypt password hashing.
- **Database**: Prisma ORM with PostgreSQL support & Zero-Config Local Persistent Store fallback.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Directory Structure
```
mahadev-electro-hub/
├── client/                     # React + Vite Frontend
│   ├── public/
│   │   ├── images/logo.png     # Official Mahadev Electro Hub Logo
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/         # Header, Footer, HeroSlider, ProductCard, AdminLayout...
│   │   ├── context/            # LanguageContext, CartContext, AuthContext
│   │   ├── pages/              # Shop, ProductDetails, Checkout, Orders, Admin...
│   │   ├── services/api.js     # Unified API Client
│   │   └── translations.js     # English & Hindi Dictionary
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Node.js + Express Backend
    ├── prisma/
    │   └── schema.prisma       # PostgreSQL Schema
    ├── public/uploads/         # Direct PC Uploaded Images
    ├── src/
    │   ├── config/             # Environment Configuration
    │   ├── database/           # Store, Seed Data, Connection Diagnostic
    │   ├── routes/             # Auth, Products, Categories, Orders, Uploads, CMS...
    │   └── server.js           # Server Entry Point (Port 5000)
    ├── package.json
    └── .env
```

### 3. Starting the Development Servers

#### Backend:
```bash
cd server
npm start
# Runs on http://localhost:5000
```

#### Frontend:
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

---

## 🔑 Default Credentials

- **Admin Portal**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
  - **Email**: `admin@mahadevelectrohub.com`
  - **Password**: `Admin@Mahadev2026`

- **Customer Test Account**:
  - Customers can register directly at `/register` or login at `/login`.

---

## 🗄️ Database Setup (PostgreSQL)

The application includes complete **Prisma ORM** definitions for PostgreSQL.

### Connecting to Managed PostgreSQL (Neon / Supabase / Render / Local):
1. In `server/.env`, set your connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-sample-12345.ap-southeast-1.aws.neon.tech/mahadev_db?sslmode=require"
   ```
2. Run database migration and generate client:
   ```bash
   cd server
   npx prisma db push
   ```
3. If PostgreSQL is not reachable, the system automatically runs on the included resilient local persistent store (`server/data/store.json`), allowing immediate local development without database blocks.
