import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { ApiError } from '../utils/apiError';

export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, code: err.code, message: err.message, requestId: req.requestId, details: err.details });
    return;
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({ success: false, code: 'UPLOAD_ERROR', message: err.message, requestId: req.requestId });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({ success: false, code: 'VALIDATION_ERROR', message: 'Validation error', requestId: req.requestId, details: err.format() });
    return;
  }

  logger.error('[ERROR] Unhandled request error', { message: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    requestId: req.requestId,
    ...(env.NODE_ENV === 'production' ? {} : { stack: err.stack })
  });
}
