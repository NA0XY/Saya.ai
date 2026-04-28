import path from 'path';
import type { NextFunction, Request, Response } from 'express';
import { prescriptionUpload } from '../config/upload';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        publicPath?: string;
      }
    }
  }
}

export interface UploadedFile extends Express.Multer.File {
  publicPath: string;
}

export function handlePrescriptionUpload(req: Request, res: Response, next: NextFunction): void {
  prescriptionUpload.single('prescription')(req, res, (error: unknown) => {
    if (error) {
      next(error instanceof Error ? error : new Error('Upload failed'));
      return;
    }
    if (req.file) {
      req.file.publicPath = path.join('uploads', 'prescriptions', req.file.filename).split(path.sep).join('/');
    }
    next();
  });
}

export function handleMedicineImageUpload(req: Request, res: Response, next: NextFunction): void {
  prescriptionUpload.single('image')(req, res, (error: unknown) => {
    if (error) {
      next(error instanceof Error ? error : new Error('Upload failed'));
      return;
    }
    if (req.file) {
      req.file.publicPath = path.join('uploads', 'prescriptions', req.file.filename).split(path.sep).join('/');
    }
    next();
  });
}
