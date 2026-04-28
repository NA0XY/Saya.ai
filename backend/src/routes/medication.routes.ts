import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware';
import { medicationController } from '../modules/medications/medication.controller';
import { CreateScheduleSchema } from '../modules/medications/medication.types';

const IdParamsSchema = z.object({ id: z.string().uuid() });
const PatientQuerySchema = z.object({ patientId: z.string().uuid() });

export const medicationRouter = Router();
medicationRouter.post('/', authMiddleware, validateBody(CreateScheduleSchema), medicationController.create);
medicationRouter.get('/', authMiddleware, validateQuery(PatientQuerySchema), medicationController.list);
medicationRouter.delete('/:id', authMiddleware, validateParams(IdParamsSchema), medicationController.delete);
medicationRouter.post('/:id/trigger', authMiddleware, validateParams(IdParamsSchema), medicationController.trigger);
