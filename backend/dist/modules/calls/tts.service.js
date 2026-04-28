"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ttsService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../../config/env");
const apiError_1 = require("../../utils/apiError");
const logger_1 = require("../../config/logger");
exports.ttsService = {
    async synthesizeSpeech(request) {
        if (!env_1.env.AWS_ACCESS_KEY_ID) {
            logger_1.logger.warn('[TTS] AWS credentials not configured, returning silence stub');
            return Buffer.alloc(0);
        }
        throw apiError_1.ApiError.badGateway('AWS Polly integration has been removed. TTS service is unavailable.', undefined, 'TTS_UNAVAILABLE');
    },
    async synthesizeToUrl(text, language, scheduleId) {
        const dir = path_1.default.resolve(process.cwd(), env_1.env.UPLOAD_DIR, 'tts');
        fs_1.default.mkdirSync(dir, { recursive: true });
        const filename = `${scheduleId}.mp3`;
        const audio = await this.synthesizeSpeech({ text, language });
        fs_1.default.writeFileSync(path_1.default.join(dir, filename), audio);
        return `${env_1.env.BACKEND_URL}/uploads/tts/${filename}`;
    }
};
//# sourceMappingURL=tts.service.js.map