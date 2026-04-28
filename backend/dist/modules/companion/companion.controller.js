"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companionController = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const asyncHandler_1 = require("../../utils/asyncHandler");
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
const news_service_1 = require("../news/news.service");
const patient_repository_1 = require("../patients/patient.repository");
const patient_service_1 = require("../patients/patient.service");
const companion_service_1 = require("./companion.service");
const memory_service_1 = require("./memory.service");
exports.companionController = {
    chat: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const response = await companion_service_1.companionService.chat(req.body, req.user.id);
        res.json((0, apiResponse_1.successResponse)(response));
    }),
    getHistory: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user.id);
        const history = await companion_service_1.companionService.getHistory(req.params.patientId, 50);
        res.json((0, apiResponse_1.successResponse)(history));
    }),
    getMemories: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(req.params.patientId, req.user.id);
        const memories = await memory_service_1.memoryService.getMemories(req.params.patientId);
        res.json((0, apiResponse_1.successResponse)(memories));
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