import express from 'express';
import { prisma } from '../database/connection.js';
import { requireAdmin } from '../middleware/auth.js';
import { deleteFile } from '../services/storageService.js';

const router = express.Router();

// GET /api/reels - Public: Fetch all active reels sorted by sortOrder
router.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const where = includeInactive ? {} : { isActive: true };

    const reels = await prisma.reel.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      count: reels.length,
      reels
    });
  } catch (err) {
    console.error('Error fetching reels from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// GET /api/reels/admin - Admin: Fetch all reels including inactive
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const reels = await prisma.reel.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      count: reels.length,
      reels
    });
  } catch (err) {
    console.error('Error fetching admin reels from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// GET /api/reels/:id - Fetch single reel by ID
router.get('/:id', async (req, res) => {
  try {
    const reel = await prisma.reel.findUnique({
      where: { id: req.params.id }
    });

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found.' });
    }

    res.json({ success: true, reel });
  } catch (err) {
    console.error('Error fetching single reel from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// POST /api/reels - Admin: Create new reel
router.post('/', requireAdmin, async (req, res) => {
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

    const currentCount = await prisma.reel.count();
    const newReel = await prisma.reel.create({
      data: {
        title: title.trim(),
        category: category ? category.trim() : 'General',
        description: description ? description.trim() : '',
        sourceType: sourceType || 'url',
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : currentCount + 1,
        isActive: isActive !== false,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reel created successfully in database.',
      reel: newReel
    });
  } catch (err) {
    console.error('Error creating reel in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// PUT /api/reels/:id - Admin: Update reel
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.reel.findUnique({ where: { id: req.params.id } });
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

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (category !== undefined) data.category = category ? category.trim() : null;
    if (description !== undefined) data.description = description ? description.trim() : null;
    if (sourceType !== undefined) data.sourceType = sourceType;
    if (videoUrl !== undefined) data.videoUrl = videoUrl.trim();
    if (thumbnailUrl !== undefined) data.thumbnailUrl = thumbnailUrl ? thumbnailUrl.trim() : null;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.reel.update({
      where: { id: req.params.id },
      data
    });

    res.json({
      success: true,
      message: 'Reel updated successfully in database.',
      reel: updated
    });
  } catch (err) {
    console.error('Error updating reel in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// PATCH /api/reels/reorder - Admin: Reorder multiple reels
router.patch('/reorder', requireAdmin, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array is required.' });
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.reel.update({
          where: { id },
          data: { sortOrder: index + 1 }
        })
      )
    );

    const reordered = await prisma.reel.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      message: 'Reels reordered successfully in database.',
      reels: reordered
    });
  } catch (err) {
    console.error('Error reordering reels in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// PATCH /api/reels/:id/toggle - Admin: Toggle active status
router.patch('/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.reel.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reel not found.' });
    }

    const updated = await prisma.reel.update({
      where: { id: req.params.id },
      data: { isActive: !existing.isActive }
    });

    res.json({
      success: true,
      message: `Reel ${updated.isActive ? 'activated' : 'deactivated'} successfully in database.`,
      reel: updated
    });
  } catch (err) {
    console.error('Error toggling reel status in database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// DELETE /api/reels/:id - Admin: Delete reel
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.reel.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reel not found or already deleted.' });
    }

    // Clean up media in permanent storage if applicable
    if (existing.videoUrl) {
      deleteFile(existing.videoUrl).catch(() => {});
    }
    if (existing.thumbnailUrl) {
      deleteFile(existing.thumbnailUrl).catch(() => {});
    }

    await prisma.reel.delete({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: 'Reel deleted permanently from database.'
    });
  } catch (err) {
    console.error('Error deleting reel from database:', err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

export default router;
