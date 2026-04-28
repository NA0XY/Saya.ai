import { Router } from 'express';
import { z } from 'zod';
import { optionalDemoAuth } from '../middleware/auth.middleware';
import { uploadLimiter } from '../middleware/rateLimit.middleware';
import { handlePrescriptionUpload } from '../middleware/upload.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware';
import { prescriptionController } from '../modules/prescriptions/prescription.controller';
import { VerifyPrescriptionSchema } from '../modules/prescriptions/prescription.validator';
import { safetyController } from '../modules/safety/safety.controller';

const PrescriptionParamsSchema = z.object({ id: z.string().min(1) });
const PrescriptionQuerySchema = z.object({ patientId: z.union([z.string().uuid(), z.literal('demo-patient-uuid')]), demo: z.string().optional() });

export const prescriptionRouter = Router();
prescriptionRouter.post('/', optionalDemoAuth, uploadLimiter, handlePrescriptionUpload, prescriptionController.upload);
prescriptionRouter.get('/', optionalDemoAuth, validateQuery(PrescriptionQuerySchema), prescriptionController.list);
prescriptionRouter.get('/:id', optionalDemoAuth, validateParams(PrescriptionParamsSchema), prescriptionController.getOne);
prescriptionRouter.post('/:id/verify', optionalDemoAuth, validateParams(PrescriptionParamsSchema), validateBody(VerifyPrescriptionSchema), prescriptionController.verify);
prescriptionRouter.get('/:id/warnings', optionalDemoAuth, validateParams(PrescriptionParamsSchema), safetyController.getWarnings);
