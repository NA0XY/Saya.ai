import { Router } from 'express';
import { z } from 'zod';
import { optionalDemoAuth } from '../middleware/auth.middleware';
import { validateParams } from '../middleware/validate.middleware';
import { dashboardController } from '../modules/dashboard/dashboard.controller';

const PatientParamsSchema = z.object({ id: z.union([z.string().uuid(), z.literal('demo-patient-uuid')]) });

export const dashboardRouter = Router();
dashboardRouter.get('/', optionalDemoAuth, dashboardController.getSummary);
dashboardRouter.get('/patient/:id', optionalDemoAuth, validateParams(PatientParamsSchema), dashboardController.getPatient);
dashboardRouter.get('/patient/:id/vitals', optionalDemoAuth, validateParams(PatientParamsSchema), dashboardController.getVitals);
