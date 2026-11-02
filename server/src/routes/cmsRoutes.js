import express from 'express';
import { localStore } from '../database/store.js';
import { requireAdmin } from '../middleware/auth.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

// ---------------- ANNOUNCEMENT BAR ----------------
router.get('/announcement', (req, res) => {
  try {
    const announcement = localStore.getAnnouncement();
    res.json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/announcement', requireAdmin, (req, res) => {
  try {
    const updated = localStore.saveAnnouncement(req.body);
    res.json({ success: true, announcement: updated, message: 'Announcement updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- HERO & PROMOTIONAL BANNERS ----------------
router.get('/banners', (req, res) => {
  try {
    const { all } = req.query;
    let banners = localStore.getBanners();
    if (all !== 'true') {
      banners = banners.filter(b => b.isActive);
    }
    banners.sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json({ success: true, count: banners.length, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/banners', requireAdmin, (req, res) => {
  try {
    const newBanner = localStore.saveBanner(req.body);
    res.status(201).json({ success: true, banner: newBanner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/banners/:id', requireAdmin, (req, res) => {
  try {
    const updated = localStore.saveBanner({ ...req.body, id: req.params.id });
    res.json({ success: true, banner: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/banners/:id', requireAdmin, (req, res) => {
  try {
    localStore.deleteBanner(req.params.id);
    res.json({ success: true, message: 'Banner deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- COUPONS ----------------
router.get('/coupons/validate', (req, res) => {
  try {
    const { code, cartTotal } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const coupon = localStore.getCouponByCode(code);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
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
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/coupons', requireAdmin, (req, res) => {
  try {
    const coupons = localStore.getCoupons();
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- REVIEWS ----------------
// Public endpoint for storefront: returns all approved & published customer reviews
router.get('/reviews', (req, res) => {
  try {
    const { productId } = req.query;
    let reviews = localStore.getReviews(productId);
    const approved = (Array.isArray(reviews) ? reviews : []).filter(
      r => r.status === 'APPROVED' && r.isActive !== false
    );
    approved.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
    res.json({ success: true, count: approved.length, reviews: approved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/reviews/:productId', (req, res) => {
  try {
    const reviews = localStore.getReviews(req.params.productId).filter(
      r => r.status === 'APPROVED' && r.isActive !== false
    );
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/reviews', (req, res) => {
  try {
    const { productId, customerName, customerEmail, rating, comment, title, location } = req.body;
    if (!customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Customer name, rating, and review text are required.' });
    }

    const newRev = localStore.addReview({
      productId: productId || null,
      customerName,
      customerEmail: customerEmail || '',
      location: location || '',
      title: title || '',
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment,
      status: 'APPROVED', // Ready for display
      isActive: true,
      isVerified: true,
    });

    res.status(201).json({ success: true, message: 'Review submitted successfully!', review: newRev });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/admin/reviews', requireAdmin, (req, res) => {
  try {
    const { q } = req.query;
    let reviews = [...localStore.getReviews()];
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      reviews = reviews.filter(r =>
        (r.customerName && r.customerName.toLowerCase().includes(term)) ||
        (r.location && r.location.toLowerCase().includes(term)) ||
        (r.comment && r.comment.toLowerCase().includes(term)) ||
        (r.title && r.title.toLowerCase().includes(term)) ||
        (r.productName && r.productName.toLowerCase().includes(term))
      );
    }
    reviews.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/reviews', requireAdmin, (req, res) => {
  try {
    const { customerName, comment } = req.body;
    if (!customerName || !comment) {
      return res.status(400).json({ success: false, message: 'Customer name and review text are required.' });
    }

    const saved = localStore.saveReview({
      ...req.body,
      rating: Math.min(5, Math.max(1, Number(req.body.rating) || 5)),
      status: req.body.status || 'APPROVED',
      isActive: req.body.isActive !== false,
      isVerified: req.body.isVerified !== false,
    });

    res.status(201).json({ success: true, message: 'Customer review created successfully.', review: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/admin/reviews/:id', requireAdmin, (req, res) => {
  try {
    const existing = localStore.getReviewById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const updated = localStore.saveReview({
      ...existing,
      ...req.body,
      id: req.params.id,
      rating: Math.min(5, Math.max(1, Number(req.body.rating) || existing.rating || 5)),
    });

    res.json({ success: true, message: 'Customer review updated successfully.', review: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/admin/reviews/:id/toggle', requireAdmin, (req, res) => {
  try {
    const rev = localStore.getReviewById(req.params.id);
    if (!rev) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    const updated = localStore.saveReview({
      id: req.params.id,
      isActive: rev.isActive === false ? true : false,
    });
    res.json({
      success: true,
      message: `Review ${updated.isActive ? 'published' : 'unpublished'} successfully.`,
      review: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/admin/reviews/:id', requireAdmin, (req, res) => {
  try {
    const { status, isActive } = req.body;
    let rev = localStore.getReviewById(req.params.id);
    if (!rev) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    const updatePayload = { id: req.params.id };
    if (status !== undefined) updatePayload.status = status;
    if (isActive !== undefined) updatePayload.isActive = isActive;

    const updated = localStore.saveReview(updatePayload);
    res.json({ success: true, message: 'Review updated.', review: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/admin/reviews/:id', requireAdmin, (req, res) => {
  try {
    const deleted = localStore.deleteReview(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/admin/reviews/reorder', requireAdmin, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array is required.' });
    }
    const updated = localStore.reorderReviews(orderedIds);
    res.json({ success: true, message: 'Reviews reordered successfully.', reviews: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- STORE SETTINGS ----------------
router.get('/settings', (req, res) => {
  try {
    const settings = localStore.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/settings', requireAdmin, (req, res) => {
  try {
    const updated = localStore.updateSettings(req.body);
    res.json({ success: true, settings: updated, message: 'Store settings updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- TRANSLATIONS & MULTILINGUAL CMS ----------------
router.get('/translations', (req, res) => {
  try {
    const translations = localStore.getTranslations();
    res.json({ success: true, translations: translations || { en: {}, hinglish: {}, hi: {} } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/translations', requireAdmin, (req, res) => {
  try {
    const updated = localStore.saveTranslations(req.body);
    res.json({ success: true, translations: updated, message: 'Translations updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- NEW ARRIVALS CMS MANAGEMENT ----------------
router.get('/new-arrivals', (req, res) => {
  try {
    const config = localStore.getNewArrivalsConfig();
    const allProducts = localStore.getProducts();

    // Map each item in config to its live product record, preserving order and status
    const orderedProducts = [];
    if (Array.isArray(config.items)) {
      const sortedItems = [...config.items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      for (const item of sortedItems) {
        const prod = allProducts.find(p => p.id === item.productId);
        if (prod) {
          orderedProducts.push({
            ...prod,
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
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/new-arrivals', requireAdmin, (req, res) => {
  try {
    const updated = localStore.saveNewArrivalsConfig(req.body);
    res.json({ success: true, message: 'New Arrivals configuration saved.', config: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- COLLECTION PROMO SLIDER (5 SLIDES) ----------------
router.get('/collection-slides', (req, res) => {
  try {
    const { all } = req.query;
    let slides = localStore.getCollectionPromoSlides();
    if (all !== 'true') {
      slides = slides.filter(s => s.isActive !== false);
    }
    slides.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    res.json({ success: true, count: slides.length, slides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/collection-slides', requireAdmin, (req, res) => {
  try {
    const { slides } = req.body;
    if (!Array.isArray(slides)) {
      return res.status(400).json({ success: false, message: 'Invalid slides payload. Array expected.' });
    }
    const updated = localStore.saveCollectionPromoSlides(slides);
    res.json({ success: true, message: 'Collection promo slides saved.', slides: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- NEWSLETTER SUBSCRIPTIONS ----------------
router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address (e.g., name@gmail.com).' });
    }

    const { isNew, subscriber } = localStore.subscribeNewsletter(email);

    // Notify business email when a new subscriber joins
    if (isNew) {
      emailService.sendNewsletterNotification(subscriber).catch(err => {
        console.error('[CmsRoutes] Newsletter notification failed:', err.message);
      });
    }

    res.json({
      success: true,
      message: isNew
        ? 'Thank you for subscribing to Mahadev Electro Hub updates!'
        : 'You are already subscribed to our newsletter.',
      subscriber
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/admin/newsletters', requireAdmin, (req, res) => {
  try {
    const subscribers = localStore.getNewsletterSubscriptions();
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- CONTACT & WEBSITE ENQUIRIES ----------------
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message, type } = req.body;
    if (!name || (!email && !phone) || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, contact detail (email or mobile number), and message are required.'
      });
    }

    const inquiry = localStore.createInquiry({ name, email, phone, message, type });

    // Asynchronously dispatch notification to business inbox (mahadevelectohub@gmail.com)
    emailService.sendContactNotification(inquiry).catch(err => {
      console.error('[CmsRoutes] Contact inquiry notification failed:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Aapka message safalta-purvak bhej diya gaya hai! Mahadev Electro Hub team jaldi sampark karegi.',
      inquiry
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/admin/inquiries', requireAdmin, (req, res) => {
  try {
    const inquiries = localStore.getInquiries();
    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
