"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromImage = extractTextFromImage;
const vision_1 = __importDefault(require("@google-cloud/vision"));
const logger_1 = require("../../config/logger");
const env_1 = require("../../config/env");
const apiError_1 = require("../../utils/apiError");
const timeout_1 = require("../../utils/timeout");
const client = new vision_1.default.ImageAnnotatorClient();
async function extractTextFromImage(filePath) {
    try {
        const [result] = await (0, timeout_1.withTimeout)(client.textDetection(filePath), env_1.env.GOOGLE_VISION_TIMEOUT_MS, 'GOOGLE_VISION_TIMEOUT', 'Google Vision request timed out');
        const annotation = result.fullTextAnnotation;
        const rawText = annotation?.text ?? result.textAnnotations?.[0]?.description ?? '';
        const confidences = annotation?.pages?.flatMap((page) => page.blocks?.map((block) => block.confidence ?? 0).filter((confidence) => confidence > 0) ?? []) ?? [];
        const confidence = confidences.length ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length : null;
        return { rawText, confidence };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger_1.logger.error('[OCR] Google Vision failed', { filePath, error: message });
        throw apiError_1.ApiError.badGateway('Google Vision OCR failed', { error: message }, 'GOOGLE_VISION_ERROR');
    }
}
//# sourceMappingURL=googleVision.client.js.map