import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initialCategories,
  initialProducts,
  initialBanners,
  initialAnnouncement,
  initialAdmin,
  initialCoupons,
  initialReels
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache synced with disk
let state = null;
let lastMtime = 0;

function loadStore() {
  if (fs.existsSync(STORE_FILE)) {
    try {
      const stats = fs.statSync(STORE_FILE);
      if (state && stats.mtimeMs === lastMtime) {
        return state;
      }
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      state = JSON.parse(raw);
      if (!Array.isArray(state.reels)) {
        state.reels = [...initialReels];
      }
      if (!Array.isArray(state.newsletters)) {
        state.newsletters = [];
      }
      if (!Array.isArray(state.inquiries)) {
        state.inquiries = [];
      }
      lastMtime = stats.mtimeMs;
      return state;
    } catch (err) {
      console.error('Error reading store.json, re-initializing default seed data:', err.message);
    }
  }

  if (state) return state;

  // Initialize from seedData
  state = {
    categories: initialCategories,
    products: initialProducts,
    banners: initialBanners,
    announcement: initialAnnouncement,
    admins: [initialAdmin],
    customers: [],
    orders: [],
    coupons: initialCoupons,
    reels: initialReels,
    reviews: [
      {
        id: 'rev-01',
        productId: 'prod-farming-laser-torch-100w',
        customerName: 'Ramesh Patel',
        customerEmail: 'ramesh.farmer@gmail.com',
        rating: 5,
        comment: 'बहुत ही बढ़िया टॉर्च है! रात को खेत में 1 किलोमीटर तक साफ दिखता है। बैटरी बैकअप भी शानदार है।',
        status: 'APPROVED',
        createdAt: new Date().toISOString()
      },
      {
        id: 'rev-02',
        productId: 'prod-zatka-5km-solar-machine',
        customerName: 'Vikram Singh (Pali)',
        customerEmail: 'vikram.pali@yahoo.com',
        rating: 5,
        comment: 'Great zatka machine. Kept stray cattle away from our castor crops. Safe shock and loud siren.',
        status: 'APPROVED',
        createdAt: new Date().toISOString()
      }
    ],
    settings: {
      storeName: 'Mahadev Electro Hub',
      phone: '+91 98765 43210',
      email: 'contact@mahadevelectrohub.com',
      address: 'Main Market, Pali, Rajasthan, India - 306401',
      freeShippingThreshold: 1000,
      standardShippingFee: 99,
      codEnabled: false,
      advancePaymentEnabled: true,
      razorpayEnabled: true,
    },
    translations: {
      en: {},
      hinglish: {},
      hi: {}
    }
  };

  saveStore();
  return state;
}

function saveStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store.json:', err.message);
  }
}

export const localStore = {
  get: loadStore,
  save: saveStore,

  // Categories
  getCategories: () => loadStore().categories,
  getCategoryByIdOrSlug: (idOrSlug) => {
    const s = loadStore();
    return s.categories.find(c => c.id === idOrSlug || c.slug === idOrSlug) || null;
  },
  saveCategory: (categoryData) => {
    const s = loadStore();
    const existingIndex = s.categories.findIndex(c => c.id === categoryData.id || c.slug === categoryData.slug);
    if (existingIndex >= 0) {
      s.categories[existingIndex] = { ...s.categories[existingIndex], ...categoryData, updatedAt: new Date().toISOString() };
      saveStore();
      return s.categories[existingIndex];
    } else {
      const newCat = {
        id: categoryData.id || `cat-${Date.now()}`,
        order: s.categories.length + 1,
        isActive: true,
        showInNav: true,
        subcategories: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...categoryData,
      };
      s.categories.push(newCat);
      saveStore();
      return newCat;
    }
  },
  deleteCategory: (id) => {
    const s = loadStore();
    const initialLen = s.categories.length;
    s.categories = s.categories.filter(c => c.id !== id);
    saveStore();
    return s.categories.length < initialLen;
  },

  // Products
  getProducts: (filterFn) => {
    const s = loadStore();
    if (typeof filterFn === 'function') {
      return s.products.filter(filterFn);
    }
    return s.products;
  },
  getProductByIdOrSlug: (idOrSlug) => {
    const s = loadStore();
    return s.products.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
  },
  saveProduct: (prodData) => {
    const s = loadStore();
    const existingIndex = s.products.findIndex(p => p.id === prodData.id || (prodData.slug && p.slug === prodData.slug));
    if (existingIndex >= 0) {
      s.products[existingIndex] = { ...s.products[existingIndex], ...prodData, updatedAt: new Date().toISOString() };
      saveStore();
      return s.products[existingIndex];
    } else {
      const newProd = {
        id: prodData.id || `prod-${Date.now()}`,
        brand: 'Mahadev Electro Hub',
        status: 'ACTIVE',
        featured: false,
        newArrival: true,
        bestSeller: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...prodData,
      };
      s.products.unshift(newProd);
      saveStore();
      return newProd;
    }
  },
  deleteProduct: (id) => {
    const s = loadStore();
    const initialLen = s.products.length;
    s.products = s.products.filter(p => p.id !== id);
    saveStore();
    return s.products.length < initialLen;
  },

  // Orders
  getOrders: () => loadStore().orders,
  getOrderByIdOrNumber: (idOrNumber) => {
    const s = loadStore();
    return s.orders.find(o => o.id === idOrNumber || o.orderNumber === idOrNumber) || null;
  },
  createOrder: (orderData) => {
    const s = loadStore();
    const orderNumber = `MEH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const paymentPlan = orderData.paymentPlan || (orderData.paymentMethod === 'ADVANCE_25' ? 'ADVANCE_25' : (orderData.paymentMethod === 'ADVANCE_50' ? 'ADVANCE_50' : 'FULL_100'));
    const advancePercentage = paymentPlan === 'ADVANCE_25' ? 25 : (paymentPlan === 'ADVANCE_50' ? 50 : 100);

    const totalAmount = Number((orderData.totalAmount || 0).toFixed(2));
    const payableNow = Number((orderData.payableNow !== undefined ? orderData.payableNow : (totalAmount * (advancePercentage / 100))).toFixed(2));
    const amountPaid = Number((orderData.amountPaid || 0).toFixed(2));
    const remainingBalance = Number((orderData.remainingBalance !== undefined ? orderData.remainingBalance : (totalAmount - amountPaid)).toFixed(2));

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      status: orderData.status || 'PENDING',
      paymentPlan,
      advancePercentage,
      totalAmount,
      payableNow,
      amountPaid,
      remainingBalance,
      paymentMethod: paymentPlan,
      paymentStatus: orderData.paymentStatus || (advancePercentage === 100 ? 'Payment Pending' : 'Advance Payment Pending'),
      advanceTransactionId: orderData.advanceTransactionId || null,
      finalTransactionId: orderData.finalTransactionId || null,
      balanceReconciledAt: orderData.balanceReconciledAt || null,
      balanceReconciledBy: orderData.balanceReconciledBy || null,
      balanceNotes: orderData.balanceNotes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...orderData,
    };
    s.orders.unshift(newOrder);

    // Deduct stock for ordered items
    if (Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        const prod = s.products.find(p => p.id === item.productId);
        if (prod && typeof prod.stockQuantity === 'number') {
          prod.stockQuantity = Math.max(0, prod.stockQuantity - (item.quantity || 1));
        }
      }
    }

    saveStore();
    return newOrder;
  },
  updateOrderStatus: (idOrNumber, status, paymentStatus) => {
    const s = loadStore();
    const order = s.orders.find(o => o.id === idOrNumber || o.orderNumber === idOrNumber);
    if (!order) return null;
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    saveStore();
    return order;
  },
  reconcileOrderBalance: (idOrNumber, { amountCollected, finalTransactionId, notes, reconciledBy } = {}) => {
    const s = loadStore();
    const order = s.orders.find(o => o.id === idOrNumber || o.orderNumber === idOrNumber);
    if (!order) return null;

    const collected = Number((amountCollected !== undefined ? amountCollected : order.remainingBalance).toFixed(2));
    order.amountPaid = Number((order.totalAmount || (order.amountPaid + collected)).toFixed(2));
    order.remainingBalance = 0;
    order.paymentStatus = 'Fully Paid';
    order.finalTransactionId = finalTransactionId || `REC-DELIVERY-${Date.now()}`;
    order.balanceReconciledAt = new Date().toISOString();
    order.balanceReconciledBy = reconciledBy || 'Admin';
    order.balanceNotes = notes || 'Collected and reconciled at delivery.';
    order.updatedAt = new Date().toISOString();

    saveStore();
    return order;
  },
  saveOrder: (orderData) => {
    const s = loadStore();
    const idx = s.orders.findIndex(o => o.id === orderData.id || o.orderNumber === orderData.orderNumber);
    if (idx >= 0) {
      s.orders[idx] = { ...s.orders[idx], ...orderData, updatedAt: new Date().toISOString() };
      saveStore();
      return s.orders[idx];
    }
    return null;
  },

  // Newsletter Subscriptions
  getNewsletterSubscriptions: () => {
    const s = loadStore();
    if (!Array.isArray(s.newsletters)) s.newsletters = [];
    return s.newsletters;
  },
  subscribeNewsletter: (email) => {
    const s = loadStore();
    if (!Array.isArray(s.newsletters)) s.newsletters = [];
    const normalized = email.trim().toLowerCase();
    const existing = s.newsletters.find(sub => sub.email.toLowerCase() === normalized);
    if (existing) {
      return { isNew: false, subscriber: existing };
    }
    const subscriber = {
      id: `sub-${Date.now()}`,
      email: normalized,
      subscribedAt: new Date().toISOString(),
      isActive: true,
    };
    s.newsletters.unshift(subscriber);
    saveStore();
    return { isNew: true, subscriber };
  },

  // Customer Inquiries & Contact Forms
  getInquiries: () => {
    const s = loadStore();
    if (!Array.isArray(s.inquiries)) s.inquiries = [];
    return s.inquiries;
  },
  createInquiry: (inquiryData) => {
    const s = loadStore();
    if (!Array.isArray(s.inquiries)) s.inquiries = [];
    const inquiry = {
      id: `inq-${Date.now()}`,
      name: inquiryData.name ? inquiryData.name.trim() : 'Anonymous',
      email: inquiryData.email ? inquiryData.email.trim().toLowerCase() : null,
      phone: inquiryData.phone ? inquiryData.phone.trim() : null,
      message: inquiryData.message ? inquiryData.message.trim() : '',
      type: inquiryData.type || 'GENERAL',
      status: 'NEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    s.inquiries.unshift(inquiry);
    saveStore();
    return inquiry;
  },

  // Admins & Customers
  getAdminByEmail: (email) => {
    const s = loadStore();
    return s.admins.find(a => a.email.toLowerCase() === email.toLowerCase()) || null;
  },
  getCustomerByPhoneOrEmail: (identifier) => {
    const s = loadStore();
    return s.customers.find(c => c.phone === identifier || c.email === identifier) || null;
  },
  saveCustomer: (custData) => {
    const s = loadStore();
    const existingIndex = s.customers.findIndex(c => c.id === custData.id || c.phone === custData.phone);
    if (existingIndex >= 0) {
      s.customers[existingIndex] = { ...s.customers[existingIndex], ...custData, updatedAt: new Date().toISOString() };
      saveStore();
      return s.customers[existingIndex];
    } else {
      const newCust = {
        id: `cust-${Date.now()}`,
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...custData,
      };
      s.customers.push(newCust);
      saveStore();
      return newCust;
    }
  },

  // Banners, Announcements, Coupons, Reviews, Settings
  getBanners: () => loadStore().banners,
  saveBanner: (bannerData) => {
    const s = loadStore();
    const idx = s.banners.findIndex(b => b.id === bannerData.id);
    if (idx >= 0) {
      s.banners[idx] = { ...s.banners[idx], ...bannerData, updatedAt: new Date().toISOString() };
      saveStore();
      return s.banners[idx];
    } else {
      const newBan = { id: `ban-${Date.now()}`, isActive: true, order: s.banners.length + 1, ...bannerData };
      s.banners.push(newBan);
      saveStore();
      return newBan;
    }
  },
  deleteBanner: (id) => {
    const s = loadStore();
    s.banners = s.banners.filter(b => b.id !== id);
    saveStore();
    return true;
  },
  getAnnouncement: () => loadStore().announcement,
  saveAnnouncement: (annData) => {
    const s = loadStore();
    s.announcement = { ...s.announcement, ...annData, updatedAt: new Date().toISOString() };
    saveStore();
    return s.announcement;
  },
  getCoupons: () => loadStore().coupons,
  getCouponByCode: (code) => {
    const s = loadStore();
    return s.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive) || null;
  },
  getReviews: (filter) => {
    const s = loadStore();
    if (!Array.isArray(s.reviews)) s.reviews = [];
    if (typeof filter === 'function') {
      return s.reviews.filter(filter);
    }
    if (typeof filter === 'string' && filter.trim()) {
      return s.reviews.filter(r => r.productId === filter.trim());
    }
    return s.reviews;
  },
  getReviewById: (id) => {
    const s = loadStore();
    return (s.reviews || []).find(r => r.id === id) || null;
  },
  addReview: (revData) => {
    const s = loadStore();
    if (!Array.isArray(s.reviews)) s.reviews = [];
    const newRev = {
      id: revData.id || `rev-${Date.now()}`,
      status: revData.status || 'APPROVED',
      isActive: revData.isActive !== false,
      isVerified: revData.isVerified !== false,
      sortOrder: Number(revData.sortOrder) || (s.reviews.length + 1),
      createdAt: revData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...revData,
    };
    s.reviews.unshift(newRev);
    saveStore();
    return newRev;
  },
  saveReview: (reviewData) => {
    const s = loadStore();
    if (!Array.isArray(s.reviews)) s.reviews = [];
    const existingIndex = s.reviews.findIndex(r => r.id === reviewData.id);
    if (existingIndex >= 0) {
      s.reviews[existingIndex] = {
        ...s.reviews[existingIndex],
        ...reviewData,
        updatedAt: new Date().toISOString(),
      };
      saveStore();
      return s.reviews[existingIndex];
    } else {
      const newRev = {
        id: reviewData.id || `rev-${Date.now()}`,
        status: reviewData.status || 'APPROVED',
        isActive: reviewData.isActive !== false,
        isVerified: reviewData.isVerified !== false,
        sortOrder: Number(reviewData.sortOrder) || (s.reviews.length + 1),
        createdAt: reviewData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...reviewData,
      };
      s.reviews.unshift(newRev);
      saveStore();
      return newRev;
    }
  },
  deleteReview: (id) => {
    const s = loadStore();
    if (!Array.isArray(s.reviews)) return false;
    const initialLen = s.reviews.length;
    s.reviews = s.reviews.filter(r => r.id !== id);
    saveStore();
    return s.reviews.length < initialLen;
  },
  reorderReviews: (orderedIds) => {
    const s = loadStore();
    if (!Array.isArray(s.reviews) || !Array.isArray(orderedIds)) return s.reviews;
    orderedIds.forEach((id, idx) => {
      const item = s.reviews.find(r => r.id === id);
      if (item) item.sortOrder = idx + 1;
    });
    s.reviews.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
    saveStore();
    return s.reviews;
  },
  updateReviewStatus: (id, status) => {
    const s = loadStore();
    const rev = s.reviews.find(r => r.id === id);
    if (rev) {
      rev.status = status;
      rev.updatedAt = new Date().toISOString();
      saveStore();
      return rev;
    }
    return null;
  },
  getSettings: () => loadStore().settings,
  updateSettings: (newSettings) => {
    const s = loadStore();
    s.settings = { ...s.settings, ...newSettings };
    saveStore();
    return s.settings;
  },

  // Custom Multilingual Translations Override
  getTranslations: () => {
    const s = loadStore();
    if (!s.translations) {
      s.translations = { en: {}, hinglish: {}, hi: {} };
      saveStore();
    }
    return s.translations;
  },
  saveTranslations: (transData) => {
    const s = loadStore();
    if (!s.translations) {
      s.translations = { en: {}, hinglish: {}, hi: {} };
    }
    // Deep merge for languages en, hinglish, hi
    if (transData) {
      if (transData.en) s.translations.en = { ...(s.translations.en || {}), ...transData.en };
      if (transData.hinglish) s.translations.hinglish = { ...(s.translations.hinglish || {}), ...transData.hinglish };
      if (transData.hi) s.translations.hi = { ...(s.translations.hi || {}), ...transData.hi };
    }
    saveStore();
    return s.translations;
  },

  // Dynamic New Arrivals CMS Configuration
  getNewArrivalsConfig: () => {
    const s = loadStore();
    if (!s.newArrivalsConfig) {
      s.newArrivalsConfig = {
        title_en: 'New Arrivals',
        title_hi: 'नए उत्पाद',
        subtitle_en: 'Discover Our Latest Products',
        subtitle_hi: 'हमारे नवीनतम उत्पाद देखें',
        displayLimit: 8,
        items: s.products.map((p, i) => ({
          productId: p.id,
          order: i + 1,
          enabled: p.newArrival !== false
        }))
      };
      saveStore();
    }
    return s.newArrivalsConfig;
  },
  saveNewArrivalsConfig: (newConfig) => {
    const s = loadStore();
    s.newArrivalsConfig = {
      ...(s.newArrivalsConfig || {}),
      ...newConfig,
      updatedAt: new Date().toISOString()
    };

    // Synchronize the newArrival flag on product items
    if (Array.isArray(newConfig.items)) {
      const enabledSet = new Set(newConfig.items.filter(i => i.enabled).map(i => i.productId));
      const inItemsSet = new Set(newConfig.items.map(i => i.productId));
      for (const p of s.products) {
        if (inItemsSet.has(p.id)) {
          p.newArrival = enabledSet.has(p.id);
        }
      }
    }

    saveStore();
    return s.newArrivalsConfig;
  },

  // Dynamic Homepage Collection Promo Slider (5 Slides)
  getCollectionPromoSlides: () => {
    const s = loadStore();
    if (!Array.isArray(s.collectionPromoSlides) || s.collectionPromoSlides.length === 0) {
      s.collectionPromoSlides = [
        {
          id: 'slide-torches',
          collectionKey: 'torches',
          tag_en: 'FEATURED COLLECTION',
          tag_hi: 'विशेष कलेक्शन',
          title_en: 'Heavy-Duty Farming & Tactical Torches',
          title_hi: 'शक्तिशाली किसान व सुरक्षा लेजर टॉर्च',
          description_en: 'Ultra-bright long-range LED torches with up to 1.5 km focused beam throw, massive 10,000 mAh rechargeable backup, and dual solar charging built for night farming.',
          description_hi: '1.5 किमी तक फोकस लेजर बीम, 10,000 mAh दमदार बैटरी बैकअप और सोलर चार्जिंग सपोर्ट के साथ खेतों की रात में रखवाली के लिए सर्वश्रेष्ठ टॉर्च।',
          image: '/images/banners/Mahadev Electro Hub Flashlight Showcase (1).png',
          link: '/category/torches',
          categoryName: 'Torches',
          ctaText_en: 'Shop Now',
          ctaText_hi: 'अभी खरीदें',
          order: 1,
          isActive: true
        },
        {
          id: 'slide-zatka',
          collectionKey: 'zatka-machines',
          tag_en: 'FARM PERIMETER DEFENSE',
          tag_hi: 'खेत सुरक्षा बाड़',
          title_en: 'Solar Zatka Machines & Boundary Fencing',
          title_hi: 'सोलर झटका मशीनें व बाउंड्री फेंसिंग',
          description_en: 'Non-lethal high-voltage solar electric fence energizers designed to protect agricultural crops and orchards from wild animals, boars, and stray cattle 24/7.',
          description_hi: 'फसलों को नीलगाय और आवारा पशुओं से 24 घंटे सुरक्षित रखने के लिए 2 किमी व 5 किमी क्षमता वाली हेवी-ड्यूटी सोलर झटका मशीनें।',
          image: '/images/banners/Mahadev Electric Fence Energizers Ad.png',
          link: '/category/zatka-machines',
          categoryName: 'Zatka Machines',
          ctaText_en: 'Shop Now',
          ctaText_hi: 'अभी खरीदें',
          order: 2,
          isActive: true
        },
        {
          id: 'slide-solar-street-lights',
          collectionKey: 'solar-street-lights',
          tag_en: 'AUTONOMOUS OUTDOOR LIGHTING',
          tag_hi: 'ऑटोमैटिक सोलर लाइट',
          title_en: 'All-In-One Automatic Solar Street Lights',
          title_hi: 'ऑल-इन-वन ऑटोमैटिक सोलर स्ट्रीट लाइट्स',
          description_en: 'Zero electricity bill lighting equipped with intelligent dusk-to-dawn radar motion sensors, heavy-duty lithium battery packs, and IP65 weatherproof durability.',
          description_hi: 'जीरो बिजली बिल, शाम होते ही खुद ऑन होने वाले रडार मोशन सेंसर, वाटरप्रूफ IP65 बॉडी और पूरी रात निरंतर रोशनी।',
          image: '/images/banners/Mahadev Solar Street Light Showcase (1).png',
          link: '/category/solar-street-lights',
          categoryName: 'Solar Street Lights',
          ctaText_en: 'Shop Now',
          ctaText_hi: 'अभी खरीदें',
          order: 3,
          isActive: true
        },
        {
          id: 'slide-headlamps',
          collectionKey: 'headlamps',
          tag_en: 'HANDS-FREE FIELD ILLUMINATION',
          tag_hi: 'रिचार्जेबल हेडलाइट्स',
          title_en: 'Heavy-Duty Multi-Beam Headlamps',
          title_hi: 'हेवी-ड्यूटी मल्टी-बीम हेडलाइट्स',
          description_en: 'Ergonomic 90-degree tilt hands-free lighting with concentrated long-beam spotlight and wide COB floodlight for night farming, tractor repairs, and outdoor work.',
          description_hi: 'खेतों में काम और नाइट पेट्रोलिंग के लिए 90° एडजस्टेबल टिल्ट, डुअल स्पॉट व फ्लड COB बीम और कम्फर्टेबल हेडबैंड।',
          image: '/images/banners/Mahadev Head Lamp_ Adventure Illuminated.png',
          link: '/category/headlamps',
          categoryName: 'Headlamps',
          ctaText_en: 'Shop Now',
          ctaText_hi: 'अभी खरीदें',
          order: 4,
          isActive: true
        },
        {
          id: 'slide-pocket-torches',
          collectionKey: 'small-pocket-torches',
          tag_en: 'POCKET TACTICAL POWER',
          tag_hi: 'कॉम्पैक्ट पॉकेट टॉर्च',
          title_en: 'Precision Zoomable Pocket Torches',
          title_hi: 'प्रिसिजन ज़ूमेबल कॉम्पैक्ट पॉकेट टॉर्च',
          description_en: 'Compact aircraft-grade aluminum torches delivering intense zoomable laser beam focus, USB Type-C fast charging, and dependable pocket-sized power for everyday carry.',
          description_hi: 'मजबूत एयरक्राफ्ट मेटल बॉडी, टाइप-सी फास्ट चार्जिंग और अत्यधिक शक्तिशाली ज़ूम लेजर बीम के साथ हर सफर के लिए उत्तम पॉकेट टॉर्च।',
          image: '/images/banners/Mahadev Pocket Torch Adventure Banner.png',
          link: '/category/small-pocket-torches',
          categoryName: 'Small Pocket Torches',
          ctaText_en: 'Shop Now',
          ctaText_hi: 'अभी खरीदें',
          order: 5,
          isActive: true
        }
      ];
      saveStore();
    }
    return s.collectionPromoSlides;
  },

  saveCollectionPromoSlides: (slides) => {
    const s = loadStore();
    if (Array.isArray(slides)) {
      s.collectionPromoSlides = slides;
      saveStore();
    }
    return s.collectionPromoSlides;
  },

  // Reels Management
  getReels: (includeInactive = false) => {
    const s = loadStore();
    if (!Array.isArray(s.reels)) {
      s.reels = [...initialReels];
      saveStore();
    }
    const filtered = includeInactive ? s.reels : s.reels.filter(r => r.isActive !== false);
    return [...filtered].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  getReelById: (id) => {
    const s = loadStore();
    if (!Array.isArray(s.reels)) return null;
    return s.reels.find(r => r.id === id) || null;
  },

  saveReel: (reelData) => {
    const s = loadStore();
    if (!Array.isArray(s.reels)) {
      s.reels = [...initialReels];
    }
    const existingIndex = s.reels.findIndex(r => r.id === reelData.id);
    if (existingIndex >= 0) {
      s.reels[existingIndex] = {
        ...s.reels[existingIndex],
        ...reelData,
        updatedAt: new Date().toISOString()
      };
      saveStore();
      return s.reels[existingIndex];
    } else {
      const newReel = {
        id: reelData.id || ('reel-' + Date.now()),
        title: reelData.title || 'Untitled Reel',
        category: reelData.category || 'General',
        description: reelData.description || '',
        sourceType: reelData.sourceType || 'url',
        videoUrl: reelData.videoUrl || '',
        thumbnailUrl: reelData.thumbnailUrl || '',
        sortOrder: typeof reelData.sortOrder === 'number' ? reelData.sortOrder : s.reels.length + 1,
        isActive: reelData.isActive !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      s.reels.push(newReel);
      saveStore();
      return newReel;
    }
  },

  toggleReelStatus: (id) => {
    const s = loadStore();
    if (!Array.isArray(s.reels)) return null;
    const reel = s.reels.find(r => r.id === id);
    if (!reel) return null;
    reel.isActive = !reel.isActive;
    reel.updatedAt = new Date().toISOString();
    saveStore();
    return reel;
  },

  reorderReels: (orderedIds) => {
    const s = loadStore();
    if (!Array.isArray(s.reels) || !Array.isArray(orderedIds)) return s.reels;
    orderedIds.forEach((id, index) => {
      const reel = s.reels.find(r => r.id === id);
      if (reel) {
        reel.sortOrder = index + 1;
        reel.updatedAt = new Date().toISOString();
      }
    });
    saveStore();
    return s.reels.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  deleteReel: (id) => {
    const s = loadStore();
    if (!Array.isArray(s.reels)) return false;
    const initialLen = s.reels.length;
    s.reels = s.reels.filter(r => r.id !== id);
    saveStore();
    return s.reels.length < initialLen;
  }
};
