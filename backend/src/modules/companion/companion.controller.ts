import type { Request, Response } from 'express';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/apiError';
import { newsService } from '../news/news.service';
import { patientRepository } from '../patients/patient.repository';
import { patientService } from '../patients/patient.service';
import { companionService } from './companion.service';
import type { ChatRequest } from './companion.types';
import { memoryService } from './memory.service';

export const companionController = {
  chat: asyncHandler(async (req: Request<object, object, ChatRequest>, res: Response) => {
    const response = await companionService.chat(req.body, req.user!.id);
    res.json(successResponse(response));
  }),
  getHistory: asyncHandler(async (req: Request<{ patientId: string }>, res: Response) => {
    await patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user!.id);
    const history = await companionService.getHistory(req.params.patientId, 50);
    res.json(successResponse(history));
  }),
  getMemories: asyncHandler(async (req: Request<{ patientId: string }>, res: Response) => {
    await patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user!.id);
    const memories = await memoryService.getMemories(req.params.patientId);
    res.json(successResponse(memories));
  }),
  deleteMemory: asyncHandler(async (req: Request<{ patientId: string; memoryKey: string }>, res: Response) => {
    await patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user!.id);
    const { error } = await supabase
      .from('patient_memories')
      .delete()
      .eq('patient_id', req.params.patientId)
      .eq('memory_key', req.params.memoryKey);

    if (error) throw ApiError.internal('Failed to delete memory');
    res.json(successResponse({ deleted: true }));
  }),
  getNews: asyncHandler(async (_req: Request, res: Response) => {
    const news = await newsService.getLatestNews(8);
    res.json(successResponse(news));
  }),
  getPreferences: asyncHandler(async (req: Request<{ patientId: string }>, res: Response) => {
    await patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user!.id);
    const patient = await patientRepository.findById(req.params.patientId);
    if (!patient) throw ApiError.notFound('Patient');
    res.json(successResponse({ tone: patient.companion_tone, language: patient.language_preference }));
  }),
  updatePreferences: asyncHandler(async (
    req: Request<{ patientId: string }, object, { tone: 'warm' | 'formal' | 'playful'; language: 'hi' | 'en' }>,
    res: Response
  ) => {
    await patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user!.id);
    const updated = await patientRepository.update(req.params.patientId, {
      companion_tone: req.body.tone,
      language_preference: req.body.language
    });
    res.json(successResponse(updated));
  })
};
