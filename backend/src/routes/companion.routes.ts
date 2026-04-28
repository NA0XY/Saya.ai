import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { companionLimiter } from '../middleware/rateLimit.middleware';
import { validateBody, validateParams } from '../middleware/validate.middleware';
import { companionController } from '../modules/companion/companion.controller';

const ChatSchema = z.object({ patient_id: z.string().uuid(), message: z.string().min(1), language: z.enum(['hi', 'en']).default('hi') });
const PatientParamsSchema = z.object({ patientId: z.string().uuid() });
export const companionRouter = Router();
companionRouter.post('/chat', authMiddleware, companionLimiter, validateBody(ChatSchema), companionController.chat);
companionRouter.get('/history/:patientId', authMiddleware, validateParams(PatientParamsSchema), companionController.getHistory);
