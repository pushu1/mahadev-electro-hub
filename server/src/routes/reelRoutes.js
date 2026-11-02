import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { localStore } from '../database/store.js';

const router = express.Router();

// GET /api/reels - Public: Fetch all active reels sorted by sortOrder
router.get('/', (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const reels = localStore.getReels(includeInactive);
    res.json({
      success: true,
      count: reels.length,
      reels
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reels/admin - Admin: Fetch all reels including inactive
router.get('/admin', requireAdmin, (req, res) => {
  try {
    const reels = localStore.getReels(true);
    res.json({
      success: true,
      count: reels.length,
      reels
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reels/:id - Fetch single reel by ID
router.get('/:id', (req, res) => {
  try {
    const reel = localStore.getReelById(req.params.id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found.' });
    }
    res.json({ success: true, reel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reels - Admin: Create new reel
router.post('/', requireAdmin, (req, res) => {
  try {
    const {
      title,
      category,
      description,
      sourceType,
      videoUrl,
      thumbnailUrl,
      sortOrder,
      isActive
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Reel title is required.' });
    }

    if (!videoUrl || !videoUrl.trim()) {
      return res.status(400).json({ success: false, message: 'Video file or video URL is required.' });
    }

    const newReel = localStore.saveReel({
      title: title.trim(),
      category: category ? category.trim() : 'General',
      description: description ? description.trim() : '',
      sourceType: sourceType || 'url',
      videoUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : '',
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      isActive: isActive !== false,
    });

    res.status(201).json({
      success: true,
      message: 'Reel created successfully.',
      reel: newReel
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/reels/:id - Admin: Update reel
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const existing = localStore.getReelById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reel not found.' });
    }

    const {
      title,
      category,
      description,
      sourceType,
      videoUrl,
      thumbnailUrl,
      sortOrder,
      isActive
    } = req.body;

    const updated = localStore.saveReel({
      id: req.params.id,
      title: title !== undefined ? title.trim() : existing.title,
      category: category !== undefined ? category.trim() : existing.category,
      description: description !== undefined ? description.trim() : existing.description,
      sourceType: sourceType !== undefined ? sourceType : existing.sourceType,
      videoUrl: videoUrl !== undefined ? videoUrl.trim() : existing.videoUrl,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl.trim() : existing.thumbnailUrl,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : existing.sortOrder,
      isActive: isActive !== undefined ? isActive : existing.isActive,
    });

    res.json({
      success: true,
      message: 'Reel updated successfully.',
      reel: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/reels/reorder - Admin: Reorder multiple reels
router.patch('/reorder', requireAdmin, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array is required.' });
    }

    const reordered = localStore.reorderReels(orderedIds);
    res.json({
      success: true,
      message: 'Reels reordered successfully.',
      reels: reordered
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/reels/:id/toggle - Admin: Toggle active status
router.patch('/:id/toggle', requireAdmin, (req, res) => {
  try {
    const updated = localStore.toggleReelStatus(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Reel not found.' });
    }

    res.json({
      success: true,
      message: `Reel ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
      reel: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/reels/:id - Admin: Delete reel
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const deleted = localStore.deleteReel(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Reel not found or already deleted.' });
    }

    res.json({
      success: true,
      message: 'Reel deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
