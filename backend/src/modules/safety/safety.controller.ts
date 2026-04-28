import { z } from 'zod';
import type { Request, Response } from 'express';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { safetyService } from './safety.service';

const SafetyCheckSchema = z.object({ drug_names: z.array(z.string().min(1)).min(1) });

export const safetyController = {
  getWarnings: asyncHandler(async (req: Request<{ prescriptionId?: string; id?: string }>, res: Response) => {
    const prescriptionId = req.params.prescriptionId ?? req.params.id!;
    const report = req.query.demo === 'true' || prescriptionId.startsWith('demo-') ? await safetyService.demoReport(prescriptionId) : await safetyService.getSafetyReportForPrescription(prescriptionId, req.user!.id);
    res.json(successResponse(report));
  }),
  checkDrugs: asyncHandler(async (req: Request, res: Response) => {
    const input = SafetyCheckSchema.parse(req.body);
    const report = await safetyService.checkDrugs(input.drug_names);
    res.json(successResponse(report));
  })
};
