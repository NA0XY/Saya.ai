import type { Request, Response } from 'express';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { dashboardService } from './dashboard.service';
import { demoVitalsService } from './demoVitals.service';

export const dashboardController = {
  getSummary: asyncHandler(async (req: Request<object, object, object, { demo?: string }>, res: Response) => {
    const data = await dashboardService.getDashboardData(req.user?.id ?? 'demo-caregiver-uuid', req.query.demo === 'true');
    res.json(successResponse(data));
  }),
  getPatient: asyncHandler(async (req: Request<{ id: string }, object, object, { demo?: string }>, res: Response) => {
    const data = await dashboardService.getPatientDashboard(req.params.id, req.user?.id ?? 'demo-caregiver-uuid', req.query.demo === 'true');
    res.json(successResponse(data));
  }),
  getVitals: asyncHandler(async (req: Request<{ id: string }, object, object, { metric?: string }>, res: Response) => {
    const data = await demoVitalsService.getDemoVitals(req.params.id, req.query.metric);
    res.json(successResponse(data));
  })
};
