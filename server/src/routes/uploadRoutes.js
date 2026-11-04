import express from 'express';
import multer from 'multer';
import path from 'path';
import { handleUpload } from '@vercel/blob/client';
import { requireAdmin } from '../middleware/auth.js';
import { uploadFile, deleteFile, getStorageStatus, isBlobConfigured } from '../services/storageService.js';

const router = express.Router();

// Memory storage exclusively so Vercel Serverless NEVER encounters EROFS
const memoryStorage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|svg/;
  const mime = allowed.test(file.mimetype);
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (mime || ext) {
    return cb(null, true);
  }
  cb(new Error('Only image files (JPEG, JPG, PNG, WebP, GIF, SVG) are allowed.'));
};

const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB for images
  fileFilter: imageFileFilter,
});

const videoFileFilter = (req, file, cb) => {
  const allowedExts = /mp4|webm|ogg|mov|m4v/;
  const isExtAllowed = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const isMimeAllowed = file.mimetype.startsWith('video/') || /mp4|webm|ogg|quicktime/.test(file.mimetype);

  if (isExtAllowed || isMimeAllowed) {
    return cb(null, true);
  }
  cb(new Error('Only video files (MP4, WebM, OGG, MOV) are allowed.'));
};

const videoUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: videoFileFilter,
});

// Diagnostic endpoint: get storage status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    storage: getStorageStatus(),
  });
});

/**
 * Direct Client-to-Storage Token Handshake (Vercel Blob)
 * This enables the browser to upload large videos & images directly to Vercel Blob CDN,
 * bypassing Vercel Serverless 4.5MB request-body limits entirely!
 */
router.post('/blob-auth', async (req, res) => {
  try {
    // Only require authorization on client token generation requests
    if (req.body?.type === 'blob.generate-client-token') {
      const authHeader = req.headers.authorization;
      // In production, verify an auth token is provided for security
      if (process.env.NODE_ENV === 'production' && !authHeader) {
        return res.status(401).json({ success: false, message: 'Authorization header required.' });
      }
    }

    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Enforce supported formats & size limits
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4',
            'video/webm',
            'video/quicktime',
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB max
          validUntil: Date.now() + 60 * 60 * 1000, // 1 hour token
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('[Storage] Direct client upload completed:', blob.url);
      },
    });

    return res.json(jsonResponse);
  } catch (error) {
    console.error('[Storage] handleUpload error:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Admin upload single video (Server-side fallback)
router.post('/video', requireAdmin, videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a video file to upload.' });
    }

    const fileUrl = await uploadFile(req.file, 'reels');
    res.json({
      success: true,
      message: 'Video uploaded successfully to permanent storage.',
      fileUrl,
      url: fileUrl,
      fileName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin upload single image
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const fileUrl = await uploadFile(req.file, 'products');
    res.json({
      success: true,
      message: 'Image uploaded successfully to permanent storage.',
      fileUrl,
      url: fileUrl,
      fileName: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin upload multiple images
router.post('/multiple', requireAdmin, upload.array('images', 12), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select image files to upload.' });
    }

    const fileUrls = [];
    for (const f of req.files) {
      const url = await uploadFile(f, 'products');
      fileUrls.push(url);
    }

    res.json({
      success: true,
      message: `${req.files.length} images uploaded successfully to permanent storage.`,
      fileUrls,
      urls: fileUrls,
    });
  } catch (err) {
    console.error('[Upload Multiple Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin delete file from permanent storage
router.delete('/', requireAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (url) {
      await deleteFile(url);
    }
    res.json({ success: true, message: 'File deleted from permanent storage.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
