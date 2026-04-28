import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadLimiter } from '../middleware/rateLimit.middleware';
import { handleMedicineImageUpload } from '../middleware/upload.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { frontendContractController } from '../modules/frontendContract/frontendContract.controller';
import {
  FrontendChatSchema,
  FrontendOnboardingSchema,
  FrontendScheduleSchema,
  GoogleAuthSchema,
  HealthVitalsQuerySchema,
  PatientNumberSchema,
  UpdateSettingsSchema
} from '../modules/frontendContract/frontendContract.types';

export const frontendContractRouter = Router();

frontendContractRouter.get('/auth/google/start', frontendContractController.googleOAuthStart);
frontendContractRouter.get('/auth/google/callback', frontendContractController.googleOAuthCallback);

frontendContractRouter.post('/auth/google', validateBody(GoogleAuthSchema), frontendContractController.googleAuth);

frontendContractRouter.get('/user/profile', authMiddleware, frontendContractController.profile);
frontendContractRouter.put('/user/patient-number', authMiddleware, validateBody(PatientNumberSchema), frontendContractController.patientNumber);
frontendContractRouter.put('/user/settings', authMiddleware, validateBody(UpdateSettingsSchema), frontendContractController.updateSettings);
frontendContractRouter.post('/user/onboarding', authMiddleware, validateBody(FrontendOnboardingSchema), frontendContractController.onboarding);

frontendContractRouter.get('/dashboard/safety-status', authMiddleware, frontendContractController.safetyStatuses);
frontendContractRouter.get('/dashboard/alerts', authMiddleware, frontendContractController.alerts);
frontendContractRouter.get('/dashboard/health-vitals', authMiddleware, validateQuery(HealthVitalsQuerySchema), frontendContractController.healthVitals);

frontendContractRouter.post('/medications/extract', authMiddleware, uploadLimiter, handleMedicineImageUpload, frontendContractController.extractMedicines);
frontendContractRouter.post('/medications/schedule', authMiddleware, validateBody(FrontendScheduleSchema), frontendContractController.scheduleMedication);

frontendContractRouter.post('/companion/chat', authMiddleware, validateBody(FrontendChatSchema), frontendContractController.companionChat);
