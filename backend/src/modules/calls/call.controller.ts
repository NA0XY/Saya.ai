import type { Request, Response } from 'express';
import { ApiError } from '../../utils/apiError';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { medicationRepository } from '../medications/medication.repository';
import { callService } from './call.service';

export const callController = {
  getCallLogs: asyncHandler(async (req: Request<object, object, object, { scheduleId?: string }>, res: Response) => {
    if (!req.query.scheduleId) throw ApiError.badRequest('scheduleId query parameter is required');
    const [logs, retryJobs] = await Promise.all([
      medicationRepository.findCallLogsBySchedule(req.query.scheduleId),
      medicationRepository.findRetryJobsBySchedule(req.query.scheduleId)
    ]);
    res.json(successResponse({ call_logs: logs, retry_jobs: retryJobs }));
  }),
  triggerCall: asyncHandler(async (req: Request<object, object, { scheduleId?: string }>, res: Response) => {
    if (!req.body.scheduleId) throw ApiError.badRequest('scheduleId is required');
    const log = await callService.initiateCall(req.body.scheduleId, 1);
    res.json(successResponse(log, 'Call triggered'));
  })
};
