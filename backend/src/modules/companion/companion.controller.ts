import type { Request, Response } from 'express';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { companionService } from './companion.service';
import type { ChatRequest } from './companion.types';

export const companionController = {
  chat: asyncHandler(async (req: Request<object, object, ChatRequest>, res: Response) => {
    const response = await companionService.chat(req.body, req.user!.id);
    res.json(successResponse(response));
  }),
  getHistory: asyncHandler(async (req: Request<{ patientId: string }>, res: Response) => {
    const history = await companionService.getHistory(req.params.patientId, 50);
    res.json(successResponse(history));
  })
};
