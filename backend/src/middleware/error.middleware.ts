import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { ApiError } from '../utils/apiError';

export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    logger.warn('[API_ERROR]', { code: err.code, message: err.message, statusCode: err.statusCode, requestId: req.requestId });
    res.status(err.statusCode).json({ success: false, code: err.code, message: err.message, requestId: req.requestId, details: err.details });
    return;
  }

  if (err instanceof multer.MulterError) {
    logger.warn('[UPLOAD_ERROR]', { message: err.message, requestId: req.requestId });
    res.status(400).json({ success: false, code: 'UPLOAD_ERROR', message: err.message, requestId: req.requestId });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn('[VALIDATION_ERROR]', { errors: err.format(), requestId: req.requestId });
    res.status(422).json({ success: false, code: 'VALIDATION_ERROR', message: 'Validation error', requestId: req.requestId, details: err.format() });
    return;
  }

  logger.error('[UNHANDLED_ERROR]', { 
    method: req.method,
    path: req.path,
    message: err.message, 
    stack: err.stack,
    requestId: req.requestId 
  });
  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    requestId: req.requestId,
    ...(env.NODE_ENV === 'production' ? {} : { stack: err.stack })
  });
}
