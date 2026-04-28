import type { Request, Response } from 'express';
import { ApiError } from '../../utils/apiError';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import type { UploadedFile } from '../../middleware/upload.middleware';
import { prescriptionService } from './prescription.service';
import type { VerifyPrescriptionInput } from './prescription.types';

export const prescriptionController = {
  upload: asyncHandler(async (req: Request<object, object, { patientId?: string }, { patientId?: string }>, res: Response) => {
    const patientId = req.body.patientId ?? req.query.patientId;
    if (!patientId) throw ApiError.badRequest('patientId is required');
    const result = await prescriptionService.uploadAndProcess(req.file as UploadedFile, patientId, req.user!.id);
    res.status(201).json(successResponse(result, 'Prescription uploaded. Caregiver verification is required before safety warnings activate.'));
  }),
  verify: asyncHandler(async (req: Request<{ id: string }, object, VerifyPrescriptionInput>, res: Response) => {
    const prescription = await prescriptionService.verifyPrescription(req.params.id, req.body, req.user!.id);
    res.json(successResponse(prescription, 'Prescription verified'));
  }),
  getOne: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const prescription = await prescriptionService.getPrescription(req.params.id, req.user!.id);
    res.json(successResponse(prescription));
  }),
  list: asyncHandler(async (req: Request<object, object, object, { patientId?: string; demo?: string }>, res: Response) => {
    if (!req.query.patientId) throw ApiError.badRequest('patientId query parameter is required');
    const prescriptions = await prescriptionService.listPrescriptions(req.query.patientId, req.user?.id ?? '', req.query.demo === 'true');
    res.json(successResponse(prescriptions));
  })
};
