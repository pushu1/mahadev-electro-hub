import express from 'express';
import { prisma } from '../database/connection.js';
import { requireAdmin } from '../middleware/auth.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

// Helper to get or set JSON setting from prisma.setting
async function getJsonSetting(key, defaultValue) {
  try {
    const record = await prisma.setting.findUnique({ where: { key } });
    if (!record || !record.value) return defaultValue;
    return JSON.parse(record.value);
  } catch (err) {
    console.error(`Error parsing setting ${key}:`, err);
    return defaultValue;
  }
}

async function saveJsonSetting(key, value) {
  const jsonStr = typeof value === 'string' ? value : JSON.stringify(value);
  const record = await prisma.setting.upsert({
    where: { key },
    update: { value: jsonStr, updatedAt: new Date() },
    create: { key, value: jsonStr, updatedAt: new Date() }
  });
  try {
    return JSON.parse(record.value);
  } catch (e) {
    return value;
  }
}

// ---------------- ANNOUNCEMENT BAR ----------------
router.get('/announcement', async (req, res) => {
  try {
    let announcement = await prisma.announcement.findFirst();
    if (!announcement) {
      announcement = await prisma.announcement.create({
        data: {
          id: 'ann-primary',
          text_en: '⚡ Free Shipping across Rajasthan on orders above ₹1,000 | 25% Advance COD Available',
          text_hi: '⚡ पूरे राजस्थान में ₹1,000 से अधिक के ऑर्डर पर मुफ्त डिलीवरी | 25% एडवांस सीओडी उपलब्ध',
          link: '/shop',
          bgColor: '#F3F0E6',
          textColor: '#24532F',
          isActive: true
        }
      });
    }
    res.json({ success: true, announcement });
  } catch (err) {
    console.error('Error fetching announcement from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.put('/announcement', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.announcement.findFirst();
    const id = existing?.id || 'ann-primary';
    const { text_en, text_hi, link, bgColor, textColor, isActive } = req.body;

    const updated = await prisma.announcement.upsert({
      where: { id },
      update: {
        text_en: text_en !== undefined ? text_en : existing?.text_en || '',
        text_hi: text_hi !== undefined ? text_hi : existing?.text_hi || '',
        link: link !== undefined ? link : existing?.link || null,
        bgColor: bgColor !== undefined ? bgColor : existing?.bgColor || '#F3F0E6',
        textColor: textColor !== undefined ? textColor : existing?.textColor || '#24532F',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      create: {
        id,
        text_en: text_en || '',
        text_hi: text_hi || '',
        link: link || null,
        bgColor: bgColor || '#F3F0E6',
        textColor: textColor || '#24532F',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      }
    });

    res.json({ success: true, announcement: updated, message: 'Announcement updated in database.' });
  } catch (err) {
    console.error('Error updating announcement in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// ---------------- HERO & PROMOTIONAL BANNERS ----------------
router.get('/banners', async (req, res) => {
  try {
    const { all } = req.query;
    const where = all === 'true' ? {} : { isActive: true };
    const banners = await prisma.banner.findMany({
      where,
      orderBy: { order: 'asc' }
    });
    res.json({ success: true, count: banners.length, banners });
  } catch (err) {
    console.error('Error fetching banners from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.post('/banners', requireAdmin, async (req, res) => {
  try {
    const { title_en, title_hi, subtitle_en, subtitle_hi, image, link, ctaText_en, ctaText_hi, order, isActive } = req.body;
    if (!title_en || !image) {
      return res.status(400).json({ success: false, message: 'Banner title and image are required.' });
    }

    const currentCount = await prisma.banner.count();
    const newBanner = await prisma.banner.create({
      data: {
        title_en: title_en.trim(),
        title_hi: title_hi ? title_hi.trim() : title_en.trim(),
        subtitle_en: subtitle_en || null,
        subtitle_hi: subtitle_hi || null,
        image: image.trim(),
        link: link || null,
        ctaText_en: ctaText_en || 'Shop Now',
        ctaText_hi: ctaText_hi || 'अभी खरीदें',
        order: order !== undefined ? Number(order) : currentCount + 1,
        isActive: isActive !== false,
      }
    });

    res.status(201).json({ success: true, banner: newBanner });
  } catch (err) {
    console.error('Error creating banner in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.put('/banners/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.banner.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    const { title_en, title_hi, subtitle_en, subtitle_hi, image, link, ctaText_en, ctaText_hi, order, isActive } = req.body;
    const data = {};
    if (title_en !== undefined) data.title_en = title_en.trim();
    if (title_hi !== undefined) data.title_hi = title_hi.trim();
    if (subtitle_en !== undefined) data.subtitle_en = subtitle_en || null;
    if (subtitle_hi !== undefined) data.subtitle_hi = subtitle_hi || null;
    if (image !== undefined) data.image = image.trim();
    if (link !== undefined) data.link = link || null;
    if (ctaText_en !== undefined) data.ctaText_en = ctaText_en;
    if (ctaText_hi !== undefined) data.ctaText_hi = ctaText_hi;
    if (order !== undefined) data.order = Number(order);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.banner.update({
      where: { id: req.params.id },
      data
    });

    res.json({ success: true, banner: updated });
  } catch (err) {
    console.error('Error updating banner in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.delete('/banners/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.banner.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Banner deleted permanently from database.' });
  } catch (err) {
    console.error('Error deleting banner from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// ---------------- COUPONS ----------------
router.get('/coupons/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });
    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon code has expired.' });
    }

    const total = Number(cartTotal) || 0;
    if (total < (coupon.minOrderValue || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for coupon "${coupon.code}" is ₹${coupon.minOrderValue}.`
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (total * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: Math.min(discount, total),
      }
    });
  } catch (err) {
    console.error('Error validating coupon:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.get('/coupons', requireAdmin, async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, coupons });
  } catch (err) {
    console.error('Error fetching coupons from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// ---------------- REVIEWS ----------------
// Public endpoint for storefront: returns all approved & published customer reviews
router.get('/reviews', async (req, res) => {
  try {
    const { productId } = req.query;
    const where = { status: 'APPROVED', isActive: true };
    if (productId) where.productId = productId;

    const approved = await prisma.review.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });

    res.json({ success: true, count: approved.length, reviews: approved });
  } catch (err) {
    console.error('Error fetching reviews from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.get('/reviews/:productId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        productId: req.params.productId,
        status: 'APPROVED',
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    console.error('Error fetching product reviews from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const { productId, customerName, customerEmail, rating, comment, title, location } = req.body;
    if (!customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Customer name, rating, and review text are required.' });
    }

    let validProductId = null;
    if (productId) {
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      if (prod) validProductId = prod.id;
    }

    const currentCount = await prisma.review.count();
    const newRev = await prisma.review.create({
      data: {
        productId: validProductId,
        customerName: customerName.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        location: location ? location.trim() : null,
        title: title ? title.trim() : null,
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment: comment.trim(),
        status: 'APPROVED',
        isActive: true,
        isVerified: true,
        sortOrder: currentCount + 1,
      }
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully!', review: newRev });
  } catch (err) {
    console.error('Error submitting review to database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.get('/admin/reviews', requireAdmin, async (req, res) => {
  try {
    const { q } = req.query;
    let where = {};
    if (q && q.trim()) {
      const term = q.trim();
      where = {
        OR: [
          { customerName: { contains: term, mode: 'insensitive' } },
          { location: { contains: term, mode: 'insensitive' } },
          { comment: { contains: term, mode: 'insensitive' } },
          { title: { contains: term, mode: 'insensitive' } },
          { productName: { contains: term, mode: 'insensitive' } },
        ]
      };
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    console.error('Error fetching admin reviews from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.post('/admin/reviews', requireAdmin, async (req, res) => {
  try {
    const { customerName, comment, rating, productId, productName, location, customerPhoto, title, status, isActive, isVerified } = req.body;
    if (!customerName || !comment) {
      return res.status(400).json({ success: false, message: 'Customer name and review text are required.' });
    }

    let validProductId = null;
    if (productId) {
      const prod = await prisma.product.findUnique({ where: { id: productId } });
      if (prod) validProductId = prod.id;
    }

    const currentCount = await prisma.review.count();
    const saved = await prisma.review.create({
      data: {
        customerName: customerName.trim(),
        comment: comment.trim(),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        productId: validProductId,
        productName: productName || null,
        location: location || null,
        customerPhoto: customerPhoto || null,
        title: title || null,
        status: status || 'APPROVED',
        isActive: isActive !== false,
        isVerified: isVerified !== false,
        sortOrder: currentCount + 1,
      }
    });

    res.status(201).json({ success: true, message: 'Customer review created successfully in database.', review: saved });
  } catch (err) {
    console.error('Error creating admin review in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.put('/admin/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const { customerName, comment, rating, productId, productName, location, customerPhoto, title, status, isActive, isVerified, sortOrder } = req.body;
    const data = {};
    if (customerName !== undefined) data.customerName = customerName.trim();
    if (comment !== undefined) data.comment = comment.trim();
    if (rating !== undefined) data.rating = Math.min(5, Math.max(1, Number(rating)));
    if (productName !== undefined) data.productName = productName;
    if (location !== undefined) data.location = location;
    if (customerPhoto !== undefined) data.customerPhoto = customerPhoto;
    if (title !== undefined) data.title = title;
    if (status !== undefined) data.status = status;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (isVerified !== undefined) data.isVerified = Boolean(isVerified);
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);

    if (productId !== undefined) {
      if (productId) {
        const prod = await prisma.product.findUnique({ where: { id: productId } });
        data.productId = prod ? prod.id : null;
      } else {
        data.productId = null;
      }
    }

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data
    });

    res.json({ success: true, message: 'Customer review updated successfully in database.', review: updated });
  } catch (err) {
    console.error('Error updating review in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.patch('/admin/reviews/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const rev = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!rev) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: { isActive: !rev.isActive }
    });

    res.json({
      success: true,
      message: `Review ${updated.isActive ? 'published' : 'unpublished'} successfully in database.`,
      review: updated,
    });
  } catch (err) {
    console.error('Error toggling review status in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.patch('/admin/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const { status, isActive } = req.body;
    const data = {};
    if (status !== undefined) data.status = status;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data
    });

    res.json({ success: true, message: 'Review updated in database.', review: updated });
  } catch (err) {
    console.error('Error updating review in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.delete('/admin/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Review deleted permanently from database.' });
  } catch (err) {
    console.error('Error deleting review from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.patch('/admin/reviews/reorder', requireAdmin, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array is required.' });
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.review.update({
          where: { id },
          data: { sortOrder: index + 1 }
        })
      )
    );

    const updated = await prisma.review.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });

    res.json({ success: true, message: 'Reviews reordered successfully in database.', reviews: updated });
  } catch (err) {
    console.error('Error reordering reviews in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// ---------------- STORE SETTINGS ----------------
const defaultSettings = {
  storeName: 'Mahadev Electro Hub',
  phone: '+91 98765 43210',
  email: 'contact@mahadevelectrohub.com',
  address: 'Main Market, Pali, Rajasthan, India - 306401',
  freeShippingThreshold: 1000,
  standardShippingFee: 99,
  codEnabled: false,
  advancePaymentEnabled: true,
  razorpayEnabled: true,
};

router.get('/settings', async (req, res) => {
  try {
    const settings = await getJsonSetting('store_settings', defaultSettings);
    res.json({ success: true, settings });
  } catch (err) {
    console.error('Error fetching settings from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const current = await getJsonSetting('store_settings', defaultSettings);
    const updated = await saveJsonSetting('store_settings', { ...current, ...req.body });
    res.json({ success: true, settings: updated, message: 'Store settings saved to database.' });
  } catch (err) {
    console.error('Error saving settings to database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// ---------------- TRANSLATIONS & MULTILINGUAL CMS ----------------
router.get('/translations', async (req, res) => {
  try {
    const translations = await getJsonSetting('translations', { en: {}, hinglish: {}, hi: {} });
    res.json({ success: true, translations });
  } catch (err) {
    console.error('Error fetching translations from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.put('/translations', requireAdmin, async (req, res) => {
  try {
    const current = await getJsonSetting('translations', { en: {}, hinglish: {}, hi: {} });
    const updated = await saveJsonSetting('translations', { ...current, ...req.body });
    res.json({ success: true, translations: updated, message: 'Translations saved to database.' });
  } catch (err) {
    console.error('Error saving translations to database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// ---------------- NEW ARRIVALS CMS MANAGEMENT ----------------
router.get('/new-arrivals', async (req, res) => {
  try {
    const config = await getJsonSetting('new_arrivals_config', { items: [] });
    const allProducts = await prisma.product.findMany({
      include: {
        category: { select: { id: true, slug: true, name_en: true, name_hi: true } }
      }
    });

    const orderedProducts = [];
    if (Array.isArray(config.items)) {
      const sortedItems = [...config.items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      for (const item of sortedItems) {
        const prod = allProducts.find(p => p.id === item.productId);
        if (prod) {
          orderedProducts.push({
            ...prod,
            categorySlug: prod.category?.slug || null,
            newArrivalEnabled: item.enabled !== false,
            newArrivalOrder: Number(item.order) || 0
          });
        }
      }
    }

    res.json({
      success: true,
      config,
      products: orderedProducts
    });
  } catch (err) {
    console.error('Error fetching new arrivals from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.put('/new-arrivals', requireAdmin, async (req, res) => {
  try {
    const updated = await saveJsonSetting('new_arrivals_config', req.body);
    res.json({ success: true, message: 'New Arrivals configuration saved to database.', config: updated });
  } catch (err) {
    console.error('Error saving new arrivals to database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// ---------------- COLLECTION PROMO SLIDER (5 SLIDES) ----------------
const defaultCollectionSlides = [
  {
    id: 'slide-farming-torch',
    title_en: '100W Kisan Laser Torch',
    title_hi: '100W किसान लेजर टॉर्च',
    subtitle_en: '1.5 KM Focused Beam Throw',
    subtitle_hi: '1.5 किमी तेज लेजर फोकस',
    image: '/images/categories/farming torch.png',
    link: '/category/torches',
    order: 1,
    isActive: true,
  },
  {
    id: 'slide-zatka-machine',
    title_en: '10KV Solar Zatka Machine',
    title_hi: '10KV सोलर झटका मशीन',
    subtitle_en: '100% Crop Protection with Siren',
    subtitle_hi: 'सायरन और तेज शॉक से फसलों की सुरक्षा',
    image: '/images/categories/zatka machine.png',
    link: '/category/zatka-machines',
    order: 2,
    isActive: true,
  },
  {
    id: 'slide-solar-street-light',
    title_en: 'Automatic Solar Street Light',
    title_hi: 'ऑटोमैटिक सोलर स्ट्रीट लाइट',
    subtitle_en: 'Dusk to Dawn Radar Motion Sensor',
    subtitle_hi: 'पूरी रात ऑटोमैटिक रोशनी',
    image: '/images/categories/solar street light.png',
    link: '/category/solar-street-lights',
    order: 3,
    isActive: true,
  },
  {
    id: 'slide-headlamps',
    title_en: 'Kisan Rechargeable Headlamp',
    title_hi: 'किसान रिचार्जेबल हेडलैम्प',
    subtitle_en: 'Hands-Free 90° Adjustable Beam',
    subtitle_hi: 'खेतों में काम हेतु दोनों हाथ फ्री',
    image: '/images/categories/headlamp.png',
    link: '/category/headlamps',
    order: 4,
    isActive: true,
  },
  {
    id: 'slide-pocket-torches',
    title_en: 'Tactical Aluminum EDC Torch',
    title_hi: 'टैक्टिकल एल्युमिनियम पॉकेट टॉर्च',
    subtitle_en: 'Type-C Fast Charging & Zoom',
    subtitle_hi: 'मजबूत मेटल बॉडी और स्लाइडिंग फोकस',
    image: '/images/categories/small pocket torch.png',
    link: '/category/small-pocket-torches',
    order: 5,
    isActive: true,
  }
];

router.get('/collection-slides', async (req, res) => {
  try {
    const { all } = req.query;
    let slides = await getJsonSetting('collection_promo_slides', defaultCollectionSlides);
    if (!Array.isArray(slides) || slides.length === 0) {
      slides = defaultCollectionSlides;
    }
    if (all !== 'true') {
      slides = slides.filter(s => s.isActive !== false);
    }
    slides.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    res.json({ success: true, count: slides.length, slides });
  } catch (err) {
    console.error('Error fetching collection slides from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.put('/collection-slides', requireAdmin, async (req, res) => {
  try {
    const { slides } = req.body;
    if (!Array.isArray(slides)) {
      return res.status(400).json({ success: false, message: 'Invalid slides payload. Array expected.' });
    }
    const updated = await saveJsonSetting('collection_promo_slides', slides);
    res.json({ success: true, message: 'Collection promo slides saved to database.', slides: updated });
  } catch (err) {
    console.error('Error saving collection slides to database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// ---------------- NEWSLETTER SUBSCRIPTIONS ----------------
router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address required.' });
    }

    const sub = await prisma.newsletter.upsert({
      where: { email: email.toLowerCase().trim() },
      update: { isActive: true },
      create: { email: email.toLowerCase().trim(), isActive: true }
    });

    res.json({ success: true, message: 'Thank you for subscribing to Mahadev Electro Hub updates!' });
  } catch (err) {
    console.error('Error saving newsletter subscription:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.get('/admin/newsletters', requireAdmin, async (req, res) => {
  try {
    const newsletters = await prisma.newsletter.findMany({ orderBy: { subscribedAt: 'desc' } });
    res.json({ success: true, count: newsletters.length, newsletters });
  } catch (err) {
    console.error('Error fetching newsletter list from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// ---------------- CONTACT & WEBSITE ENQUIRIES ----------------
router.post('/contact', async (req, res) => {
  try {
    const { name, phone, email, message, type } = req.body;
    if (!name || !message) {
      return res.status(400).json({ success: false, message: 'Name and message are required.' });
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        message: message.trim(),
        type: type || 'CONTACT_PAGE',
        status: 'NEW',
      }
    });

    res.status(201).json({ success: true, message: 'Inquiry received. Mahadev Hub team will contact you shortly.', inquiry });
  } catch (err) {
    console.error('Error saving contact inquiry to database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

router.get('/admin/inquiries', requireAdmin, async (req, res) => {
  try {
    const inquiries = await prisma.contactInquiry.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (err) {
    console.error('Error fetching contact inquiries from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

export default router;
