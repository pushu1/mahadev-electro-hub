import { put, del } from '@vercel/blob';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localUploadDir = path.join(__dirname, '../../public/uploads');

// Check for Vercel Blob token
const isBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// Check for S3 / Neon Object Storage configuration
const s3Endpoint = process.env.NEON_STORAGE_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT;
const s3AccessKeyId = process.env.NEON_STORAGE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const s3SecretAccessKey = process.env.NEON_STORAGE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const s3Region = process.env.NEON_STORAGE_REGION || process.env.AWS_REGION || 'us-east-2';
const s3Bucket = process.env.NEON_STORAGE_BUCKET || process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;
const s3PublicBaseUrl = process.env.NEON_STORAGE_PUBLIC_URL || process.env.STORAGE_PUBLIC_URL;

const isS3Configured = Boolean(s3Endpoint && s3AccessKeyId && s3SecretAccessKey && s3Bucket);

let s3Client = null;
if (isS3Configured) {
  try {
    s3Client = new S3Client({
      endpoint: s3Endpoint,
      region: s3Region,
      credentials: {
        accessKeyId: s3AccessKeyId,
        secretAccessKey: s3SecretAccessKey,
      },
      forcePathStyle: true,
    });
  } catch (err) {
    console.error('[Storage] Failed to initialize S3 client:', err.message);
  }
}

export function getStorageStatus() {
  if (isBlobConfigured) {
    return {
      provider: 'Vercel Blob Storage',
      isConfigured: true,
      hasToken: true,
      directUploadSupported: true,
    };
  }
  if (isS3Configured) {
    return {
      provider: 'S3-Compatible Object Storage',
      isConfigured: true,
      bucket: s3Bucket,
      region: s3Region,
      directUploadSupported: false,
    };
  }
  return {
    provider: process.env.VERCEL ? 'None (Serverless Read-Only)' : 'Local File Storage',
    isConfigured: false,
    directUploadSupported: false,
  };
}

/**
 * Upload a file buffer to permanent storage (Vercel Blob > S3 > Local fallback in dev)
 * @param {Object} file - Express/Multer file object (with buffer or path)
 * @param {string} folder - 'products', 'banners', 'reels', etc.
 * @returns {Promise<string>} Permanent public URL of the uploaded file
 */
export async function uploadFile(file, folder = 'media') {
  const ext = path.extname(file.originalname).toLowerCase();
  const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueKey = `${folder}/${cleanBase}-${Date.now()}-${Math.round(Math.random() * 1e4)}${ext}`;

  const fileBuffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
  if (!fileBuffer) {
    throw new Error('No file buffer available for storage upload.');
  }

  // 1. Primary: Vercel Blob Storage
  if (isBlobConfigured) {
    try {
      const blob = await put(uniqueKey, fileBuffer, {
        access: 'public',
        contentType: file.mimetype || 'application/octet-stream',
      });
      return blob.url;
    } catch (err) {
      console.error('[Storage] Vercel Blob upload failed:', err.message);
      if (process.env.VERCEL) {
        throw new Error(`Permanent storage upload failed: ${err.message}`);
      }
    }
  }

  // 2. Secondary: S3-Compatible Storage
  if (isS3Configured && s3Client) {
    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: s3Bucket,
        Key: uniqueKey,
        Body: fileBuffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }));

      if (s3PublicBaseUrl) {
        return `${s3PublicBaseUrl.replace(/\/$/, '')}/${uniqueKey}`;
      }
      return `${s3Endpoint.replace(/\/$/, '')}/${s3Bucket}/${uniqueKey}`;
    } catch (err) {
      console.error('[Storage] S3 upload failed:', err.message);
      if (process.env.VERCEL) {
        throw new Error(`Permanent S3 upload failed: ${err.message}`);
      }
    }
  }

  // 3. Fallback: Local disk ONLY in local development (never on Vercel)
  if (!process.env.VERCEL) {
    if (!fs.existsSync(localUploadDir)) {
      fs.mkdirSync(localUploadDir, { recursive: true });
    }
    const filename = `${cleanBase}-${Date.now()}${ext}`;
    const localPath = path.join(localUploadDir, filename);
    fs.writeFileSync(localPath, fileBuffer);
    return `/uploads/${filename}`;
  }

  throw new Error('No permanent storage provider configured. Set BLOB_READ_WRITE_TOKEN in environment.');
}

/**
 * Delete a file from permanent storage if it belongs to Vercel Blob
 * @param {string} url - Public URL of the file to delete
 */
export async function deleteFile(url) {
  if (!url || typeof url !== 'string') return;

  if (isBlobConfigured && (url.includes('.blob.vercel-storage.com') || url.includes('/blob.vercel-storage.com'))) {
    try {
      await del(url);
    } catch (err) {
      console.warn('[Storage] Failed to delete blob:', err.message);
    }
  }
}

export { isBlobConfigured, isS3Configured };
