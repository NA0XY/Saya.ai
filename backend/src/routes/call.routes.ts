import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { callController } from '../modules/calls/call.controller';

const ScheduleQuerySchema = z.object({ scheduleId: z.string().uuid() });
const TriggerCallSchema = z.object({ scheduleId: z.string().uuid() });

export const callRouter = Router();
callRouter.get('/', authMiddleware, validateQuery(ScheduleQuerySchema), callController.getCallLogs);
callRouter.post('/trigger', authMiddleware, validateBody(TriggerCallSchema), callController.triggerCall);
