import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import type { UploadedFile } from '../../middleware/upload.middleware';
import { frontendContractService } from './frontendContract.service';
import type {
  FrontendChatInput,
  FrontendOnboardingInput,
  FrontendScheduleInput,
  GoogleAuthInput,
  HealthVitalsQuery
} from './frontendContract.types';

export const frontendContractController = {
  googleAuth: asyncHandler(async (req: Request<object, object, GoogleAuthInput>, res: Response) => {
    res.json(await frontendContractService.authenticateWithGoogle(req.body.token));
  }),

  profile: asyncHandler(async (req: Request, res: Response) => {
    res.json(await frontendContractService.getProfile(req.user!.id));
  }),

  onboarding: asyncHandler(async (req: Request<object, object, FrontendOnboardingInput>, res: Response) => {
    res.json(await frontendContractService.submitOnboarding(req.user!.id, req.body));
  }),

  safetyStatuses: asyncHandler(async (req: Request, res: Response) => {
    res.json(await frontendContractService.getSafetyStatuses(req.user!.id));
  }),

  alerts: asyncHandler(async (req: Request, res: Response) => {
    res.json(await frontendContractService.getAlerts(req.user!.id));
  }),

  healthVitals: asyncHandler(async (req: Request<object, object, object, HealthVitalsQuery>, res: Response) => {
    res.json(await frontendContractService.getHealthVitals(req.user!.id, req.query));
  }),

  extractMedicines: asyncHandler(async (req: Request, res: Response) => {
    res.json(await frontendContractService.extractMedicines(req.file as UploadedFile | undefined));
  }),

  scheduleMedication: asyncHandler(async (req: Request<object, object, FrontendScheduleInput>, res: Response) => {
    res.json(await frontendContractService.scheduleMedication(req.body, req.user!.id));
  }),

  companionChat: asyncHandler(async (req: Request<object, object, FrontendChatInput>, res: Response) => {
    res.json(await frontendContractService.chat(req.body, req.user!.id));
  })
};
