import express from 'express';
import { localStore } from '../database/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all products (Public with filters & search)
router.get('/', (req, res) => {
  try {
    const {
      q,
      category,
      subcategory,
      minPrice,
      maxPrice,
      inStock,
      featured,
      newArrival,
      bestSeller,
      sort,
      status,
      page = 1,
      limit = 24
    } = req.query;

    let products = localStore.getProducts();

    // Filter by status (default ACTIVE for storefront unless specified or admin)
    if (status) {
      products = products.filter(p => p.status === status);
    } else {
      products = products.filter(p => p.status === 'ACTIVE');
    }

    // Category filter (supports single category or comma-separated list like "torches,headlamps")
    if (category) {
      const catTokens = category.split(',').map(c => c.trim()).filter(Boolean);
      const targetIdsOrSlugs = new Set();
      catTokens.forEach(tok => {
        const catObj = localStore.getCategoryByIdOrSlug(tok);
        if (catObj) {
          targetIdsOrSlugs.add(catObj.id);
          targetIdsOrSlugs.add(catObj.slug);
        }
        targetIdsOrSlugs.add(tok);
      });
      products = products.filter(p => targetIdsOrSlugs.has(p.categoryId) || targetIdsOrSlugs.has(p.categorySlug));
    }

    // Subcategory filter
    if (subcategory) {
      products = products.filter(p => p.subcategoryId === subcategory || p.subcategorySlug === subcategory);
    }

    // Search query in English & Hindi
    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      products = products.filter(p => {
        const titleEn = (p.title_en || '').toLowerCase();
        const titleHi = (p.title_hi || '').toLowerCase();
        const descEn = (p.description_en || '').toLowerCase();
        const descHi = (p.description_hi || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        return titleEn.includes(query) || titleHi.includes(query) || descEn.includes(query) || descHi.includes(query) || sku.includes(query);
      });
    }

    // Price range
    if (minPrice) {
      products = products.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= Number(maxPrice));
    }

    // In-stock only
    if (inStock === 'true') {
      products = products.filter(p => (p.stockQuantity || 0) > 0);
    }

    // Flags
    if (featured === 'true') {
      products = products.filter(p => p.featured);
    }
    if (newArrival === 'true') {
      products = products.filter(p => p.newArrival);
    }
    if (bestSeller === 'true') {
      products = products.filter(p => p.bestSeller);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // Relevance / Featured first
        products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    // Pagination
    const total = products.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      products: paginatedProducts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single product by ID or Slug
router.get('/:idOrSlug', (req, res) => {
  try {
    const product = localStore.getProductByIdOrSlug(req.params.idOrSlug);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Attach related products
    const related = localStore.getProducts(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

    // Attach reviews
    const reviews = localStore.getReviews(product.id).filter(r => r.status === 'APPROVED');

    res.json({ success: true, product, related, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Create product
router.post('/', requireAdmin, (req, res) => {
  try {
    const {
      title_en,
      title_hi,
      slug,
      price,
      categoryId,
      subcategoryId,
      sku,
      stockQuantity,
      description_en,
      description_hi,
      mainImage,
      images,
      features_en,
      features_hi,
      specifications,
      warranty,
      shippingInfo,
      returnEligibility,
      featured,
      newArrival,
      bestSeller,
    } = req.body;

    if (!title_en || !title_hi || price === undefined || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Product Title (EN & HI), Price, and Category are required.'
      });
    }

    const generatedSlug = slug || title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const generatedSku = sku || `MEH-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProduct = localStore.saveProduct({
      title_en,
      title_hi,
      slug: generatedSlug,
      sku: generatedSku,
      price: Number(price),
      compareAtPrice: req.body.compareAtPrice ? Number(req.body.compareAtPrice) : null,
      categoryId,
      subcategoryId: subcategoryId || null,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 0,
      description_en: description_en || '',
      description_hi: description_hi || '',
      short_description_en: req.body.short_description_en || '',
      short_description_hi: req.body.short_description_hi || '',
      mainImage: mainImage || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
      images: Array.isArray(images) && images.length ? images : [mainImage || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'],
      features_en: Array.isArray(features_en) ? features_en : [],
      features_hi: Array.isArray(features_hi) ? features_hi : [],
      specifications: specifications || {},
      usage_instructions_en: req.body.usage_instructions_en || '',
      usage_instructions_hi: req.body.usage_instructions_hi || '',
      warranty: warranty || '1 Year Mahadev Hub Warranty',
      shippingInfo: shippingInfo || 'Fast dispatch from Pali, Rajasthan.',
      returnEligibility: returnEligibility || '7 Days Replacement for defects.',
      brand: req.body.brand || 'Mahadev Electro Hub',
      status: req.body.status || 'ACTIVE',
      featured: Boolean(featured),
      newArrival: Boolean(newArrival),
      bestSeller: Boolean(bestSeller),
    });

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update product
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const existing = localStore.getProductByIdOrSlug(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updated = localStore.saveProduct({
      ...existing,
      ...req.body,
      id: existing.id
    });

    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete product
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const deleted = localStore.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Quick Stock Update
router.patch('/:id/stock', requireAdmin, (req, res) => {
  try {
    const { stockQuantity } = req.body;
    if (stockQuantity === undefined) {
      return res.status(400).json({ success: false, message: 'stockQuantity is required.' });
    }

    const existing = localStore.getProductByIdOrSlug(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updated = localStore.saveProduct({
      ...existing,
      stockQuantity: Number(stockQuantity)
    });

    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
