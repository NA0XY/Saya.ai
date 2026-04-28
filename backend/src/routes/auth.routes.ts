import { Router } from 'express';
import { authController } from '../modules/auth/auth.controller';
import { LoginSchema, RegisterSchema } from '../modules/auth/auth.validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { validateBody } from '../middleware/validate.middleware';

export const authRouter = Router();
authRouter.post('/register', authLimiter, validateBody(RegisterSchema), authController.register);
authRouter.post('/login', authLimiter, validateBody(LoginSchema), authController.login);
authRouter.get('/me', authMiddleware, authController.me);
