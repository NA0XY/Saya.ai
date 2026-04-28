import type { Request, Response } from 'express';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { onboardingService } from './onboarding.service';
import type { OnboardingInput } from './onboarding.types';

export const onboardingController = {
  createPatient: asyncHandler(async (req: Request<object, object, OnboardingInput>, res: Response) => {
    const patient = await onboardingService.createPatientWithContacts(req.user!.id, req.body);
    res.status(201).json(successResponse(patient, 'Patient created'));
  }),
  getPatient: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const patient = await onboardingService.getPatient(req.params.id, req.user!.id);
    res.json(successResponse(patient));
  }),
  listPatients: asyncHandler(async (req: Request, res: Response) => {
    const patients = await onboardingService.listPatients(req.user!.id);
    res.json(successResponse(patients));
  }),
  updatePatient: asyncHandler(async (req: Request<{ id: string }, object, Partial<OnboardingInput>>, res: Response) => {
    const patient = await onboardingService.updatePatient(req.params.id, req.user!.id, req.body);
    res.json(successResponse(patient, 'Patient updated'));
  })
};
