import type { Request, Response } from 'express';
import { successResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/apiError';
import { toE164India } from '../../utils/phone';
import { newsService } from '../news/news.service';
import { patientRepository } from '../patients/patient.repository';
import { patientService } from '../patients/patient.service';
import { companionService } from './companion.service';
import type { ChatRequest, TtsStreamRequest } from './companion.types';
import { memoryService } from './memory.service';
import { companionTtsService } from './companionTts.service';
import { companionSttService } from './companionStt.service';

async function getPrimaryPatientIdForCaregiver(caregiverId: string): Promise<string | null> {
  const patients = await patientRepository.findByCaregiverId(caregiverId);
  const existing = patients[0];
  if (existing) return existing.id;

  const userResult = await supabase.from('users').select('*').eq('id', caregiverId).maybeSingle();
  if (userResult.error || !userResult.data) return null;

  let phone = '+919876543210';
  try {
    phone = toE164India(userResult.data.phone);
  } catch {
    // fallback remains valid
  }

  const created = await patientRepository.create({
    caregiver_id: caregiverId,
    full_name: userResult.data.full_name ? `${userResult.data.full_name}'s Elder` : 'Primary Elder',
    phone,
    date_of_birth: null,
    companion_tone: 'warm',
    language_preference: 'en'
  });
  return created.id;
}

export const companionController = {
  chat: asyncHandler(async (req: Request<object, object, ChatRequest>, res: Response) => {
    const response = await companionService.chat(req.body, req.user!.id);
    res.json(successResponse(response));
  }),
  streamChat: asyncHandler(async (req: Request<object, object, ChatRequest>, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const emit = (event: 'assistant_token' | 'assistant_done' | 'assistant_error', payload: unknown) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const heartbeat = setInterval(() => {
      res.write(':keepalive\n\n');
    }, 15000);

    try {
      await companionService.chatStream(req.body, req.user!.id, emit);
      res.end();
    } catch (error) {
      emit('assistant_error', {
        message: error instanceof Error ? error.message : 'Companion stream failed'
      });
      res.end();
    } finally {
      clearInterval(heartbeat);
    }
  }),
  getPatientContext: asyncHandler(async (req: Request, res: Response) => {
    const patientId = await getPrimaryPatientIdForCaregiver(req.user!.id);
    res.json(successResponse({ patient_id: patientId }));
  }),
  getHistory: asyncHandler(async (req: Request<{ patientId: string }>, res: Response) => {
    await patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user!.id);
    const history = await companionService.getHistory(req.params.patientId, 50);
    res.json(successResponse(history));
  }),
  streamTts: asyncHandler(async (req: Request<{ patientId: string }, object, TtsStreamRequest>, res: Response) => {
    await patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user!.id);
    const result = await companionTtsService.synthesizeSpeech(req.body);

    res.status(200);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'no-store, no-transform');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Transfer-Encoding', 'chunked');

    const chunkSize = 24 * 1024;
    for (let offset = 0; offset < result.audio.length; offset += chunkSize) {
      const chunk = result.audio.subarray(offset, offset + chunkSize);
      const writable = res.write(chunk);
      if (!writable) {
        await new Promise<void>((resolve) => res.once('drain', resolve));
      }
    }
    res.end();
  }),
  transcribeSpeech: asyncHandler(async (req: Request<{ patientId: string }, object, { language?: 'hi' | 'en'; capture_ms?: string }>, res: Response) => {
    await patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user!.id);
    if (!req.file?.buffer) throw ApiError.badRequest('Audio file is required');
    const captureDurationMs = Number(req.body?.capture_ms);
    const transcription = await companionSttService.transcribeAudio(
      req.file.buffer,
      req.file.mimetype ?? 'audio/webm',
      'en',
      Number.isFinite(captureDurationMs) ? captureDurationMs : undefined
    );
    res.json(successResponse(transcription));
  }),
  getMemories: asyncHandler(async (req: Request<{ patientId: string }>, res: Response) => {
    await patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user!.id);
    const memories = await memoryService.getMemories(req.params.patientId);
    res.json(successResponse(memories));
  }),
  searchMemories: asyncHandler(async (req: Request, res: Response) => {
    const patientId = req.params.patientId as string;
    const queryText = req.query.q as string;
    const limit = req.query.limit ? Number(req.query.limit) : 8;
    await patientService.assertCaregiverOwnsPatient(patientId, req.user!.id);
    const matches = await memoryService.semanticSearch(patientId, queryText, limit);
    res.json(successResponse(matches));
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
    const news = await newsService.getLatestNews(8, true);
    res.json(successResponse(news));
  }),
  getPreferences: asyncHandler(async (req: Request<{ patientId: string }>, res: Response) => {
    await patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user!.id);
    const patient = await patientRepository.findById(req.params.patientId);
    if (!patient) throw ApiError.notFound('Patient');
    res.json(successResponse({ tone: patient.companion_tone, language: 'en' as const }));
  }),
  updatePreferences: asyncHandler(async (
    req: Request<{ patientId: string }, object, { tone: 'warm' | 'formal' | 'playful'; language: 'hi' | 'en' }>,
    res: Response
  ) => {
    await patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user!.id);
    const updated = await patientRepository.update(req.params.patientId, {
      companion_tone: req.body.tone,
      language_preference: 'en'
    });
    res.json(successResponse(updated));
  })
};
