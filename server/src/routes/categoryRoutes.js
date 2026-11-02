import express from 'express';
import { prisma } from '../database/connection.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all categories (Public)
router.get('/', async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const where = includeInactive === 'true' ? {} : { isActive: true };

    const categories = await prisma.category.findMany({
      where,
      include: {
        subcategories: {
          where: includeInactive === 'true' ? {} : { isActive: true },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json({ success: true, count: categories.length, categories });
  } catch (err) {
    console.error('Error fetching categories from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Get category by ID or slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: req.params.idOrSlug },
          { slug: req.params.idOrSlug }
        ]
      },
      include: {
        subcategories: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, category });
  } catch (err) {
    console.error('Error fetching single category:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Create category
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name_en, name_hi, slug, description_en, description_hi, image, bannerImage, showInNav, order, isActive } = req.body;
    if (!name_en || !name_hi) {
      return res.status(400).json({ success: false, message: 'Both English and Hindi category names are required.' });
    }

    const generatedSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newCategory = await prisma.category.create({
      data: {
        name_en: name_en.trim(),
        name_hi: name_hi.trim(),
        slug: generatedSlug,
        description_en: description_en || null,
        description_hi: description_hi || null,
        image: image || null,
        bannerImage: bannerImage || null,
        showInNav: showInNav !== undefined ? Boolean(showInNav) : true,
        order: order !== undefined ? Number(order) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: {
        subcategories: true
      }
    });

    res.status(201).json({ success: true, category: newCategory });
  } catch (err) {
    console.error('Error creating category in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Update category
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const { name_en, name_hi, slug, description_en, description_hi, image, bannerImage, showInNav, order, isActive } = req.body;
    const data = {};
    if (name_en !== undefined) data.name_en = name_en.trim();
    if (name_hi !== undefined) data.name_hi = name_hi.trim();
    if (slug !== undefined) data.slug = slug.trim();
    if (description_en !== undefined) data.description_en = description_en || null;
    if (description_hi !== undefined) data.description_hi = description_hi || null;
    if (image !== undefined) data.image = image || null;
    if (bannerImage !== undefined) data.bannerImage = bannerImage || null;
    if (showInNav !== undefined) data.showInNav = Boolean(showInNav);
    if (order !== undefined) data.order = Number(order);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data,
      include: {
        subcategories: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json({ success: true, category: updated });
  } catch (err) {
    console.error('Error updating category in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Delete category
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check if products exist in category
    const productsCount = await prisma.product.count({ where: { categoryId: req.params.id } });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productsCount} product(s) are currently assigned to this category. Please reassign or delete them first.`
      });
    }

    await prisma.subcategory.deleteMany({ where: { categoryId: req.params.id } });
    await prisma.category.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Category deleted permanently from database.' });
  } catch (err) {
    console.error('Error deleting category from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Add subcategory
router.post('/:id/subcategories', requireAdmin, async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { subcategories: true }
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Parent category not found.' });
    }

    const { name_en, name_hi, slug, description_en, description_hi, image } = req.body;
    if (!name_en || !name_hi) {
      return res.status(400).json({ success: false, message: 'Both English and Hindi subcategory names are required.' });
    }

    const subSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newSub = await prisma.subcategory.create({
      data: {
        categoryId: category.id,
        slug: subSlug,
        name_en: name_en.trim(),
        name_hi: name_hi.trim(),
        description_en: description_en || null,
        description_hi: description_hi || null,
        image: image || null,
        order: (category.subcategories?.length || 0) + 1,
        isActive: true,
      }
    });

    const updatedCategory = await prisma.category.findUnique({
      where: { id: category.id },
      include: { subcategories: { orderBy: { order: 'asc' } } }
    });

    res.status(201).json({ success: true, subcategory: newSub, category: updatedCategory });
  } catch (err) {
    console.error('Error adding subcategory to database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// Admin: Delete subcategory
router.delete('/:id/subcategories/:subId', requireAdmin, async (req, res) => {
  try {
    await prisma.subcategory.delete({
      where: { id: req.params.subId }
    });

    const updatedCategory = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { subcategories: { orderBy: { order: 'asc' } } }
    });

    res.json({ success: true, message: 'Subcategory deleted permanently.', category: updatedCategory });
  } catch (err) {
    console.error('Error deleting subcategory from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

export default router;
