"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrService = void 0;
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
const groqNer_service_1 = require("../ner/groqNer.service");
const googleVision_client_1 = require("./googleVision.client");
exports.ocrService = {
    async processPrescritionImage(filePath, _mimeType) {
        const ocrResult = await (0, googleVision_client_1.extractTextFromImage)(filePath);
        if (!ocrResult.rawText.trim())
            throw apiError_1.ApiError.badRequest('Could not read text from image. Please upload a clearer photo.');
        const nerResult = await groqNer_service_1.groqNerService.extractMedicines(ocrResult.rawText);
        return { ocrResult, nerResult };
    },
    async saveOcrResult(prescriptionId, rawText) {
        const { error } = await supabase_1.supabase.from('prescriptions').update({ raw_ocr_text: rawText }).eq('id', prescriptionId);
        if (error)
            throw apiError_1.ApiError.internal('Failed to save OCR result');
    }
};
//# sourceMappingURL=ocr.service.js.map