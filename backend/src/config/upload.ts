import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { env } from './env';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']);
const prescriptionDir = path.resolve(process.cwd(), env.UPLOAD_DIR, 'prescriptions');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(prescriptionDir, { recursive: true });
    cb(null, prescriptionDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
    cb(null, `${Date.now()}-${uuid()}-${safeName}`);
  }
});

export const prescriptionUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, WEBP, HEIC images and PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 }
});
