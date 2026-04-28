import type { NextFunction, Request, Response } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';
import type { TokenPayload } from '../modules/auth/auth.types';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(ApiError.unauthorized('Missing bearer token'));
    return;
  }

  try {
    const decoded = jwt.verify(header.slice(7), env.JWT_SECRET) as TokenPayload;
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(ApiError.unauthorized('Token expired'));
      return;
    }
    if (error instanceof JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid token'));
      return;
    }
    next(ApiError.unauthorized());
  }
}

export function optionalDemoAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.query.demo === 'true' || req.params.patientId === 'demo-patient-uuid' || req.params.id === 'demo-patient-uuid') {
    next();
    return;
  }
  authMiddleware(req, res, next);
}
