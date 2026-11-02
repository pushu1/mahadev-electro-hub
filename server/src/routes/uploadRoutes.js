import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|svg/;
  const mime = allowed.test(file.mimetype);
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (mime && ext) {
    return cb(null, true);
  }
  cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed.'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for images
  fileFilter,
});

// Video Filter Configuration
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
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for video reels
  fileFilter: videoFileFilter,
});

// Admin upload single video
router.post('/video', requireAdmin, videoUpload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a video file to upload.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Video uploaded successfully.',
      fileUrl,
      fileName: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin upload single image
router.post('/', requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Image uploaded successfully.',
      fileUrl,
      fileName: req.file.filename,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin upload multiple images
router.post('/multiple', requireAdmin, upload.array('images', 8), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select image files to upload.' });
    }

    const fileUrls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({
      success: true,
      message: `${req.files.length} images uploaded successfully.`,
      fileUrls
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
