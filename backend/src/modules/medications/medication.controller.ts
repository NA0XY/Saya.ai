import type { Request, Response } from 'express';
import { ApiError } from '../../utils/apiError';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { medicationService } from './medication.service';
import type { CreateScheduleInput } from './medication.types';

export const medicationController = {
  create: asyncHandler(async (req: Request<object, object, CreateScheduleInput>, res: Response) => {
    const schedule = await medicationService.createSchedule(req.body, req.user!.id);
    res.status(201).json(successResponse(schedule, 'Medication schedule created'));
  }),
  list: asyncHandler(async (req: Request<object, object, object, { patientId?: string }>, res: Response) => {
    if (!req.query.patientId) throw ApiError.badRequest('patientId query parameter is required');
    const schedules = await medicationService.listSchedules(req.query.patientId, req.user!.id);
    res.json(successResponse(schedules));
  }),
  trigger: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const log = await medicationService.triggerImmediateCall(req.params.id, req.user!.id);
    res.json(successResponse(log, 'Call triggered'));
  }),
  delete: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    await medicationService.deleteSchedule(req.params.id, req.user!.id);
    res.json(successResponse({ id: req.params.id }, 'Medication schedule deactivated'));
  })
};
