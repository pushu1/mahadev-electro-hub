import express from 'express';
import { prisma } from '../database/connection.js';
import { requireAdmin } from '../middleware/auth.js';
import { deleteFile } from '../services/storageService.js';

const router = express.Router();

function formatProduct(p) {
  if (!p) return null;
  return {
    ...p,
    categorySlug: p.category?.slug || null,
    categoryName: p.category?.name_en || null,
    subcategorySlug: p.subcategory?.slug || null,
    subcategoryName: p.subcategory?.name_en || null,
  };
}

// Get all products (Public with filters & search)
router.get('/', async (req, res) => {
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

    const where = {};

    // Filter by status (default ACTIVE for storefront unless specified or admin)
    if (status) {
      where.status = status;
    } else {
      where.status = 'ACTIVE';
    }

    // Category filter
    if (category) {
      const catTokens = category.split(',').map(c => c.trim()).filter(Boolean);
      where.OR = [
        { categoryId: { in: catTokens } },
        { category: { slug: { in: catTokens } } }
      ];
    }

    // Subcategory filter
    if (subcategory) {
      const subFilter = [
        { subcategoryId: subcategory },
        { subcategory: { slug: subcategory } }
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: subFilter }];
        delete where.OR;
      } else {
        where.OR = subFilter;
      }
    }

    // Search query in English & Hindi
    if (q && q.trim()) {
      const query = q.trim();
      const searchConditions = [
        { title_en: { contains: query, mode: 'insensitive' } },
        { title_hi: { contains: query, mode: 'insensitive' } },
        { description_en: { contains: query, mode: 'insensitive' } },
        { description_hi: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ];
      if (where.AND) {
        where.AND.push({ OR: searchConditions });
      } else if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    // Price range
    if (minPrice !== undefined && minPrice !== '') {
      where.price = { ...(where.price || {}), gte: Number(minPrice) };
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      where.price = { ...(where.price || {}), lte: Number(maxPrice) };
    }

    // In-stock only
    if (inStock === 'true') {
      where.stockQuantity = { gt: 0 };
    }

    // Flags
    if (featured === 'true') {
      where.featured = true;
    }
    if (newArrival === 'true') {
      where.newArrival = true;
    }
    if (bestSeller === 'true') {
      where.bestSeller = true;
    }

    // Sorting
    let orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
    switch (sort) {
      case 'price_asc':
        orderBy = [{ price: 'asc' }];
        break;
      case 'price_desc':
        orderBy = [{ price: 'desc' }];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      default:
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, rawProducts] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: { select: { id: true, slug: true, name_en: true, name_hi: true } },
          subcategory: { select: { id: true, slug: true, name_en: true, name_hi: true } }
        }
      })
    ]);

    const formattedProducts = rawProducts.map(formatProduct);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      products: formattedProducts
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Get single product by ID or Slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const rawProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { id: req.params.idOrSlug },
          { slug: req.params.idOrSlug }
        ]
      },
      include: {
        category: true,
        subcategory: true,
        reviews: {
          where: { status: 'APPROVED', isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
        }
      }
    });

    if (!rawProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = formatProduct(rawProduct);

    // Attach related products from same category
    const relatedRaw = await prisma.product.findMany({
      where: {
        categoryId: rawProduct.categoryId,
        id: { not: rawProduct.id },
        status: 'ACTIVE'
      },
      take: 4,
      include: {
        category: { select: { id: true, slug: true, name_en: true, name_hi: true } }
      }
    });

    const related = relatedRaw.map(formatProduct);
    const reviews = rawProduct.reviews || [];

    res.json({ success: true, product, related, reviews });
  } catch (err) {
    console.error('Error fetching single product:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Create product
router.post('/', requireAdmin, async (req, res) => {
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

    // Verify category exists
    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Selected Category ID does not exist in database.' });
    }

    const baseSlug = (slug || title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
    const existingSlug = await prisma.product.findUnique({ where: { slug: baseSlug } });
    const generatedSlug = existingSlug ? `${baseSlug}-${Math.floor(100 + Math.random() * 900)}` : baseSlug;
    const generatedSku = sku || `MEH-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProduct = await prisma.product.create({
      data: {
        title_en: title_en.trim(),
        title_hi: title_hi.trim(),
        slug: generatedSlug,
        sku: generatedSku,
        price: Number(price),
        compareAtPrice: req.body.compareAtPrice ? Number(req.body.compareAtPrice) : null,
        categoryId,
        subcategoryId: subcategoryId || null,
        stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 0,
        description_en: description_en || '',
        description_hi: description_hi || '',
        short_description_en: req.body.short_description_en || null,
        short_description_hi: req.body.short_description_hi || null,
        mainImage: mainImage || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
        images: Array.isArray(images) && images.length ? images : [mainImage || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'],
        features_en: Array.isArray(features_en) ? features_en : [],
        features_hi: Array.isArray(features_hi) ? features_hi : [],
        specifications: specifications || {},
        usage_instructions_en: req.body.usage_instructions_en || null,
        usage_instructions_hi: req.body.usage_instructions_hi || null,
        warranty: warranty || '1 Year Mahadev Hub Warranty',
        shippingInfo: shippingInfo || 'Fast dispatch from Pali, Rajasthan.',
        returnEligibility: returnEligibility || '7 Days Replacement for defects.',
        brand: req.body.brand || 'Mahadev Electro Hub',
        status: req.body.status || 'ACTIVE',
        featured: Boolean(featured),
        newArrival: Boolean(newArrival),
        bestSeller: Boolean(bestSeller),
      },
      include: {
        category: true,
        subcategory: true
      }
    });

    res.status(201).json({ success: true, product: formatProduct(newProduct) });
  } catch (err) {
    console.error('Error creating product in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Update product
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const {
      title_en,
      title_hi,
      slug,
      sku,
      price,
      compareAtPrice,
      categoryId,
      subcategoryId,
      stockQuantity,
      description_en,
      description_hi,
      short_description_en,
      short_description_hi,
      mainImage,
      images,
      features_en,
      features_hi,
      specifications,
      usage_instructions_en,
      usage_instructions_hi,
      warranty,
      shippingInfo,
      returnEligibility,
      brand,
      status,
      featured,
      newArrival,
      bestSeller,
    } = req.body;

    const data = {};
    if (title_en !== undefined) data.title_en = title_en.trim();
    if (title_hi !== undefined) data.title_hi = title_hi.trim();
    if (slug !== undefined) data.slug = slug.trim();
    if (sku !== undefined) data.sku = sku.trim();
    if (price !== undefined) data.price = Number(price);
    if (compareAtPrice !== undefined) data.compareAtPrice = compareAtPrice ? Number(compareAtPrice) : null;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (subcategoryId !== undefined) data.subcategoryId = subcategoryId || null;
    if (stockQuantity !== undefined) data.stockQuantity = Number(stockQuantity);
    if (description_en !== undefined) data.description_en = description_en;
    if (description_hi !== undefined) data.description_hi = description_hi;
    if (short_description_en !== undefined) data.short_description_en = short_description_en;
    if (short_description_hi !== undefined) data.short_description_hi = short_description_hi;
    if (mainImage !== undefined) data.mainImage = mainImage;
    if (images !== undefined) data.images = Array.isArray(images) ? images : [images];
    if (features_en !== undefined) data.features_en = Array.isArray(features_en) ? features_en : [];
    if (features_hi !== undefined) data.features_hi = Array.isArray(features_hi) ? features_hi : [];
    if (specifications !== undefined) data.specifications = specifications;
    if (usage_instructions_en !== undefined) data.usage_instructions_en = usage_instructions_en;
    if (usage_instructions_hi !== undefined) data.usage_instructions_hi = usage_instructions_hi;
    if (warranty !== undefined) data.warranty = warranty;
    if (shippingInfo !== undefined) data.shippingInfo = shippingInfo;
    if (returnEligibility !== undefined) data.returnEligibility = returnEligibility;
    if (brand !== undefined) data.brand = brand;
    if (status !== undefined) data.status = status;
    if (featured !== undefined) data.featured = Boolean(featured);
    if (newArrival !== undefined) data.newArrival = Boolean(newArrival);
    if (bestSeller !== undefined) data.bestSeller = Boolean(bestSeller);

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: {
        category: true,
        subcategory: true
      }
    });

    res.json({ success: true, product: formatProduct(updated) });
  } catch (err) {
    console.error('Error updating product in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Delete product
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Clean up media in permanent storage if applicable
    if (existing.mainImage) {
      deleteFile(existing.mainImage).catch(() => {});
    }
    if (Array.isArray(existing.images)) {
      existing.images.forEach(img => deleteFile(img).catch(() => {}));
    }

    // Delete related reviews and orderItem references (handled cleanly by schema or explicit deletion)
    await prisma.review.deleteMany({ where: { productId: req.params.id } });
    await prisma.product.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Product deleted permanently from database.' });
  } catch (err) {
    console.error('Error deleting product from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Quick Stock Update
router.patch('/:id/stock', requireAdmin, async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    if (stockQuantity === undefined) {
      return res.status(400).json({ success: false, message: 'stockQuantity is required.' });
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { stockQuantity: Number(stockQuantity) },
      include: { category: true, subcategory: true }
    });

    res.json({ success: true, product: formatProduct(updated) });
  } catch (err) {
    console.error('Error updating stock in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

export default router;
