"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companionController = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const asyncHandler_1 = require("../../utils/asyncHandler");
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
const phone_1 = require("../../utils/phone");
const news_service_1 = require("../news/news.service");
const patient_repository_1 = require("../patients/patient.repository");
const patient_service_1 = require("../patients/patient.service");
const companion_service_1 = require("./companion.service");
const memory_service_1 = require("./memory.service");
const companionTts_service_1 = require("./companionTts.service");
const companionStt_service_1 = require("./companionStt.service");
async function getPrimaryPatientIdForCaregiver(caregiverId) {
    const patients = await patient_repository_1.patientRepository.findByCaregiverId(caregiverId);
    const existing = patients[0];
    if (existing)
        return existing.id;
    const userResult = await supabase_1.supabase.from('users').select('*').eq('id', caregiverId).maybeSingle();
    if (userResult.error || !userResult.data)
        return null;
    let phone = '+919876543210';
    try {
        phone = (0, phone_1.toE164India)(userResult.data.phone);
    }
    catch {
        // fallback remains valid
    }
    const created = await patient_repository_1.patientRepository.create({
        caregiver_id: caregiverId,
        full_name: userResult.data.full_name ? `${userResult.data.full_name}'s Elder` : 'Primary Elder',
        phone,
        date_of_birth: null,
        companion_tone: 'warm',
        language_preference: 'en'
    });
    return created.id;
}
exports.companionController = {
    chat: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const response = await companion_service_1.companionService.chat(req.body, req.user.id);
        res.json((0, apiResponse_1.successResponse)(response));
    }),
    streamChat: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        const emit = (event, payload) => {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(payload)}\n\n`);
        };
        const heartbeat = setInterval(() => {
            res.write(':keepalive\n\n');
        }, 15000);
        try {
            await companion_service_1.companionService.chatStream(req.body, req.user.id, emit);
            res.end();
        }
        catch (error) {
            emit('assistant_error', {
                message: error instanceof Error ? error.message : 'Companion stream failed'
            });
            res.end();
        }
        finally {
            clearInterval(heartbeat);
        }
    }),
    getPatientContext: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const patientId = await getPrimaryPatientIdForCaregiver(req.user.id);
        res.json((0, apiResponse_1.successResponse)({ patient_id: patientId }));
    }),
    getHistory: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user.id);
        const history = await companion_service_1.companionService.getHistory(req.params.patientId, 50);
        res.json((0, apiResponse_1.successResponse)(history));
    }),
    streamTts: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user.id);
        const result = await companionTts_service_1.companionTtsService.synthesizeSpeech(req.body);
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
                await new Promise((resolve) => res.once('drain', resolve));
            }
        }
        res.end();
    }),
    transcribeSpeech: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user.id);
        if (!req.file?.buffer)
            throw apiError_1.ApiError.badRequest('Audio file is required');
        const language = req.body.language === 'hi' ? 'hi' : 'en';
        const transcription = await companionStt_service_1.companionSttService.transcribeAudio(req.file.buffer, req.file.mimetype ?? 'audio/webm', language);
        res.json((0, apiResponse_1.successResponse)(transcription));
    }),
    getMemories: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user.id);
        const memories = await memory_service_1.memoryService.getMemories(req.params.patientId);
        res.json((0, apiResponse_1.successResponse)(memories));
    }),
    searchMemories: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const patientId = req.params.patientId;
        const queryText = req.query.q;
        const limit = req.query.limit ? Number(req.query.limit) : 8;
        await patient_service_1.patientService.assertCaregiverOwnsPatient(patientId, req.user.id);
        const matches = await memory_service_1.memoryService.semanticSearch(patientId, queryText, limit);
        res.json((0, apiResponse_1.successResponse)(matches));
    }),
    deleteMemory: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user.id);
        const { error } = await supabase_1.supabase
            .from('patient_memories')
            .delete()
            .eq('patient_id', req.params.patientId)
            .eq('memory_key', req.params.memoryKey);
        if (error)
            throw apiError_1.ApiError.internal('Failed to delete memory');
        res.json((0, apiResponse_1.successResponse)({ deleted: true }));
    }),
    getNews: (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const news = await news_service_1.newsService.getLatestNews(8);
        res.json((0, apiResponse_1.successResponse)(news));
    }),
    getPreferences: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user.id);
        const patient = await patient_repository_1.patientRepository.findById(req.params.patientId);
        if (!patient)
            throw apiError_1.ApiError.notFound('Patient');
        res.json((0, apiResponse_1.successResponse)({ tone: patient.companion_tone, language: patient.language_preference }));
    }),
    updatePreferences: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user.id);
        const updated = await patient_repository_1.patientRepository.update(req.params.patientId, {
            companion_tone: req.body.tone,
            language_preference: req.body.language
        });
        res.json((0, apiResponse_1.successResponse)(updated));
    })
};
//# sourceMappingURL=companion.controller.js.map