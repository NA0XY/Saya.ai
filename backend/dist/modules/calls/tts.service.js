"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ttsService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const env_1 = require("../../config/env");
const apiError_1 = require("../../utils/apiError");
const timeout_1 = require("../../utils/timeout");
const polly = new aws_sdk_1.default.Polly({ accessKeyId: env_1.env.AWS_ACCESS_KEY_ID, secretAccessKey: env_1.env.AWS_SECRET_ACCESS_KEY, region: env_1.env.AWS_REGION });
exports.ttsService = {
    async synthesizeSpeech(request) {
        try {
            const voice = request.voice ?? (request.language === 'hi' ? 'Aditi' : 'Raveena');
            const safeText = request.text.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] ?? char);
            const response = await (0, timeout_1.withTimeout)(polly.synthesizeSpeech({ OutputFormat: 'mp3', Text: `<speak>${safeText}</speak>`, TextType: 'ssml', VoiceId: voice }).promise(), env_1.env.POLLY_TIMEOUT_MS, 'POLLY_TIMEOUT', 'Amazon Polly request timed out');
            if (!response.AudioStream)
                throw apiError_1.ApiError.badGateway('Amazon Polly returned no audio', undefined, 'POLLY_EMPTY_AUDIO');
            return Buffer.isBuffer(response.AudioStream) ? response.AudioStream : Buffer.from(response.AudioStream);
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError)
                throw error;
            throw apiError_1.ApiError.badGateway('Amazon Polly request failed', { error: error instanceof Error ? error.message : String(error) }, 'POLLY_PROVIDER_ERROR');
        }
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