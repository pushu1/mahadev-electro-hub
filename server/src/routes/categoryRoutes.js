import express from 'express';
import { localStore } from '../database/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all categories (Public)
router.get('/', (req, res) => {
  try {
    const { includeInactive } = req.query;
    let categories = localStore.getCategories();

    if (includeInactive !== 'true') {
      categories = categories.filter(c => c.isActive);
    }

    // Sort by order ascending
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({ success: true, count: categories.length, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get category by ID or slug
router.get('/:idOrSlug', (req, res) => {
  try {
    const category = localStore.getCategoryByIdOrSlug(req.params.idOrSlug);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Create category
router.post('/', requireAdmin, (req, res) => {
  try {
    const { name_en, name_hi, slug, description_en, description_hi, image, bannerImage, showInNav, order, isActive } = req.body;
    if (!name_en || !name_hi) {
      return res.status(400).json({ success: false, message: 'Both English and Hindi category names are required.' });
    }

    const generatedSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCategory = localStore.saveCategory({
      name_en,
      name_hi,
      slug: generatedSlug,
      description_en: description_en || '',
      description_hi: description_hi || '',
      image: image || '',
      bannerImage: bannerImage || '',
      showInNav: showInNav !== undefined ? Boolean(showInNav) : true,
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      subcategories: req.body.subcategories || [],
    });

    res.status(201).json({ success: true, category: newCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update category
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const existing = localStore.getCategoryByIdOrSlug(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const updated = localStore.saveCategory({
      ...existing,
      ...req.body,
      id: existing.id
    });

    res.json({ success: true, category: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete category
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    // Check if products exist in category
    const products = localStore.getProducts(p => p.categoryId === req.params.id);
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${products.length} product(s) are currently assigned to this category. Please reassign or delete them first.`
      });
    }

    const deleted = localStore.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Add subcategory
router.post('/:id/subcategories', requireAdmin, (req, res) => {
  try {
    const category = localStore.getCategoryByIdOrSlug(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Parent category not found.' });
    }

    const { name_en, name_hi, slug, description_en, description_hi, image } = req.body;
    if (!name_en || !name_hi) {
      return res.status(400).json({ success: false, message: 'Both English and Hindi subcategory names are required.' });
    }

    const subSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newSub = {
      id: `sub-${Date.now()}`,
      slug: subSlug,
      name_en,
      name_hi,
      description_en: description_en || '',
      description_hi: description_hi || '',
      image: image || '',
      order: (category.subcategories?.length || 0) + 1,
      isActive: true,
    };

    if (!Array.isArray(category.subcategories)) {
      category.subcategories = [];
    }
    category.subcategories.push(newSub);
    localStore.saveCategory(category);

    res.status(201).json({ success: true, subcategory: newSub, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete subcategory
router.delete('/:id/subcategories/:subId', requireAdmin, (req, res) => {
  try {
    const category = localStore.getCategoryByIdOrSlug(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Parent category not found.' });
    }

    category.subcategories = (category.subcategories || []).filter(s => s.id !== req.params.subId && s.slug !== req.params.subId);
    localStore.saveCategory(category);

    res.json({ success: true, message: 'Subcategory deleted.', category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
