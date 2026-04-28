import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody, validateParams } from '../middleware/validate.middleware';
import { onboardingController } from '../modules/onboarding/onboarding.controller';
import { OnboardingSchema, CreatePatientSchema } from '../modules/onboarding/onboarding.validator';

const IdParamsSchema = z.object({ id: z.string().uuid() });

export const onboardingRouter = Router();
onboardingRouter.post('/patients', authMiddleware, validateBody(OnboardingSchema), onboardingController.createPatient);
onboardingRouter.get('/patients', authMiddleware, onboardingController.listPatients);
onboardingRouter.get('/patients/:id', authMiddleware, validateParams(IdParamsSchema), onboardingController.getPatient);
onboardingRouter.patch('/patients/:id', authMiddleware, validateParams(IdParamsSchema), validateBody(CreatePatientSchema.partial()), onboardingController.updatePatient);
