import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localUploadDir = path.join(__dirname, '../../public/uploads');

// Ensure local upload dir exists
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

// Check for S3 / Neon Object Storage configuration
const endpoint = process.env.NEON_STORAGE_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3 || process.env.AWS_ENDPOINT;
const accessKeyId = process.env.NEON_STORAGE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.NEON_STORAGE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.NEON_STORAGE_REGION || process.env.AWS_REGION || 'us-east-2';
const bucket = process.env.NEON_STORAGE_BUCKET || process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;
const publicBaseUrl = process.env.NEON_STORAGE_PUBLIC_URL || process.env.STORAGE_PUBLIC_URL;

const isS3Configured = Boolean(endpoint && accessKeyId && secretAccessKey && bucket);

let s3Client = null;
if (isS3Configured) {
  try {
    s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
    console.log('✅ [Storage] Neon / S3-compatible Object Storage Client initialized.');
  } catch (err) {
    console.error('⚠️ [Storage] Failed to initialize S3 client:', err.message);
  }
}

export function getStorageStatus() {
  return {
    provider: isS3Configured ? 'Neon Object Storage (S3-Compatible)' : 'Local File Storage (server/public/uploads)',
    isConfigured: isS3Configured,
    bucket: bucket || null,
    endpoint: endpoint ? endpoint.replace(/^https?:\/\//, '') : null,
    region: isS3Configured ? region : null,
    publicUrlConfigured: Boolean(publicBaseUrl),
  };
}

/**
 * Upload a file buffer or file stream to Object Storage (or local disk fallback)
 * @param {Object} file - Express/Multer file object
 * @param {string} folder - 'products', 'banners', 'reels', etc.
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export async function uploadFile(file, folder = 'media') {
  const ext = path.extname(file.originalname).toLowerCase();
  const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueKey = `${folder}/${cleanBase}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

  if (isS3Configured && s3Client) {
    try {
      const fileBuffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
      if (!fileBuffer) {
        throw new Error('No file buffer available for object storage upload.');
      }

      await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: uniqueKey,
        Body: fileBuffer,
        ContentType: file.mimetype,
        // Neon / S3 public read ACL
        ACL: 'public-read',
      }));

      // Construct public URL
      if (publicBaseUrl) {
        return `${publicBaseUrl.replace(/\/$/, '')}/${uniqueKey}`;
      }
      return `${endpoint.replace(/\/$/, '')}/${bucket}/${uniqueKey}`;
    } catch (err) {
      console.warn('⚠️ [Storage] Upload to Neon Object Storage failed, falling back to local file:', err.message);
    }
  }

  // Local fallback: write to local upload directory if not already there
  const filename = `${cleanBase}-${Date.now()}${ext}`;
  const localPath = path.join(localUploadDir, filename);

  if (file.buffer) {
    fs.writeFileSync(localPath, file.buffer);
  } else if (file.path && file.path !== localPath) {
    fs.copyFileSync(file.path, localPath);
  }

  return `/uploads/${filename}`;
}

export { isS3Configured };
