import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { companionLimiter } from '../middleware/rateLimit.middleware';
import { validateBody, validateParams } from '../middleware/validate.middleware';
import { companionController } from '../modules/companion/companion.controller';

const ChatSchema = z.object({ patient_id: z.string().uuid(), message: z.string().min(1), language: z.enum(['hi', 'en']).default('hi') });
const PatientParamsSchema = z.object({ patientId: z.string().uuid() });
const MemoryParamsSchema = z.object({ patientId: z.string().uuid(), memoryKey: z.string().min(1) });
const PreferenceSchema = z.object({
  tone: z.enum(['warm', 'formal', 'playful']),
  language: z.enum(['hi', 'en'])
});
export const companionRouter = Router();
companionRouter.post('/chat', authMiddleware, companionLimiter, validateBody(ChatSchema), companionController.chat);
companionRouter.get('/history/:patientId', authMiddleware, validateParams(PatientParamsSchema), companionController.getHistory);
companionRouter.get('/memories/:patientId', authMiddleware, validateParams(PatientParamsSchema), companionController.getMemories);
companionRouter.delete('/memories/:patientId/:memoryKey', authMiddleware, validateParams(MemoryParamsSchema), companionController.deleteMemory);
companionRouter.get('/news', authMiddleware, companionController.getNews);
companionRouter.get('/preferences/:patientId', authMiddleware, validateParams(PatientParamsSchema), companionController.getPreferences);
companionRouter.patch('/preferences/:patientId', authMiddleware, validateParams(PatientParamsSchema), validateBody(PreferenceSchema), companionController.updatePreferences);
