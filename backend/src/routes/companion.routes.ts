import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { companionLimiter } from '../middleware/rateLimit.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware';
import { companionController } from '../modules/companion/companion.controller';

const ChatSchema = z.object({ patient_id: z.string().uuid(), message: z.string().min(1), language: z.enum(['hi', 'en']).default('hi') });
const PatientParamsSchema = z.object({ patientId: z.string().uuid() });
const MemoryParamsSchema = z.object({ patientId: z.string().uuid(), memoryKey: z.string().min(1) });
const VaultSearchSchema = z.object({ q: z.string().min(2), limit: z.coerce.number().int().positive().max(20).optional() });
const TtsBodySchema = z.object({
  text: z.string().min(1).max(1500),
  language: z.enum(['hi', 'en']).optional(),
  sentiment: z.enum(['joy', 'neutral', 'anxiety', 'sadness']).optional(),
  tone: z.enum(['warm', 'formal', 'playful']).optional(),
  voiceSpeed: z.enum(['slow', 'medium', 'fast']).optional()
});
const PreferenceSchema = z.object({
  tone: z.enum(['warm', 'formal', 'playful']),
  language: z.enum(['hi', 'en'])
});

const companionAudioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const companionRouter = Router();
companionRouter.post('/chat', authMiddleware, companionLimiter, validateBody(ChatSchema), companionController.chat);
companionRouter.post('/chat/stream', authMiddleware, companionLimiter, validateBody(ChatSchema), companionController.streamChat);
companionRouter.get('/patient', authMiddleware, companionController.getPatientContext);
companionRouter.post('/tts/:patientId/stream', authMiddleware, validateParams(PatientParamsSchema), validateBody(TtsBodySchema), companionController.streamTts);
companionRouter.post('/stt/:patientId', authMiddleware, validateParams(PatientParamsSchema), companionAudioUpload.single('audio'), companionController.transcribeSpeech);
companionRouter.get('/history/:patientId', authMiddleware, validateParams(PatientParamsSchema), companionController.getHistory);
companionRouter.get('/memories/:patientId', authMiddleware, validateParams(PatientParamsSchema), companionController.getMemories);
companionRouter.delete('/memories/:patientId/:memoryKey', authMiddleware, validateParams(MemoryParamsSchema), companionController.deleteMemory);
companionRouter.get('/memories/:patientId/search', authMiddleware, validateParams(PatientParamsSchema), validateQuery(VaultSearchSchema), companionController.searchMemories);
companionRouter.get('/news', authMiddleware, companionController.getNews);
companionRouter.get('/preferences/:patientId', authMiddleware, validateParams(PatientParamsSchema), companionController.getPreferences);
companionRouter.patch('/preferences/:patientId', authMiddleware, validateParams(PatientParamsSchema), validateBody(PreferenceSchema), companionController.updatePreferences);
