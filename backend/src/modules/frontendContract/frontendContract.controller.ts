import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import type { UploadedFile } from '../../middleware/upload.middleware';
import { frontendContractService } from './frontendContract.service';
import type {
  FrontendChatInput,
  FrontendOnboardingInput,
  FrontendScheduleInput,
  GoogleAuthInput,
  HealthVitalsQuery,
  PatientNumberInput,
  UpdateSettingsInput
} from './frontendContract.types';

export const frontendContractController = {
  googleOAuthStart: asyncHandler(async (req: Request, res: Response) => {
    const returnTo = req.query.returnTo as string | undefined;
    const url = await frontendContractService.startGoogleOAuth(returnTo);
    res.json({ url });
  }),

  googleOAuthCallback: asyncHandler(async (req: Request, res: Response) => {
    const callbackUrl = await frontendContractService.handleGoogleOAuthCallback(req.query as {
      code?: string;
      state?: string;
      error?: string;
      error_description?: string;
    });
    res.redirect(callbackUrl);
  }),

  googleAuth: asyncHandler(async (req: Request<object, object, GoogleAuthInput>, res: Response) => {
    res.json(await frontendContractService.authenticateWithGoogle(req.body.token));
  }),

  profile: asyncHandler(async (req: Request, res: Response) => {
    res.json(await frontendContractService.getProfile(req.user!.id));
  }),

  patientNumber: asyncHandler(async (req: Request<object, object, PatientNumberInput>, res: Response) => {
    res.json(await frontendContractService.updatePatientNumber(req.user!.id, req.body));
  }),

  updateSettings: asyncHandler(async (req: Request<object, object, UpdateSettingsInput>, res: Response) => {
    res.json(await frontendContractService.updateSettings(req.user!.id, req.body));
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

  dashboardSummary: asyncHandler(async (req: Request, res: Response) => {
    res.json(await frontendContractService.getDashboardSummary(req.user!.id));
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
