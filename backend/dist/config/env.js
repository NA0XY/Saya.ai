"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.EnvSchema = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
exports.EnvSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(3001),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1),
    GROQ_API_KEY: zod_1.z.string().min(1),
    GOOGLE_APPLICATION_CREDENTIALS: zod_1.z.string().min(1),
    GOOGLE_CLIENT_ID: zod_1.z.string().min(1),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().min(1),
    GOOGLE_OAUTH_REDIRECT_URL: zod_1.z.string().url(),
    AWS_ACCESS_KEY_ID: zod_1.z.string().optional().default(''),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().optional().default(''),
    AWS_REGION: zod_1.z.string().optional().default('ap-south-1'),
    TWILIO_ACCOUNT_SID: zod_1.z.string().min(1),
    TWILIO_AUTH_TOKEN: zod_1.z.string().min(1),
    TWILIO_PHONE_NUMBER: zod_1.z.string().min(1),
    NEWS_API_KEY: zod_1.z.string().min(1),
    GROQ_TIMEOUT_MS: zod_1.z.coerce.number().int().positive().default(15000),
    GOOGLE_VISION_TIMEOUT_MS: zod_1.z.coerce.number().int().positive().default(15000),
    TWILIO_TIMEOUT_MS: zod_1.z.coerce.number().int().positive().default(10000),
    POLLY_TIMEOUT_MS: zod_1.z.coerce.number().int().positive().default(15000),
    NEWS_TIMEOUT_MS: zod_1.z.coerce.number().int().positive().default(10000),
    OPENFDA_API_KEY: zod_1.z.string().optional().default(''),
    OPENFDA_LABEL_URL: zod_1.z.string().url().default('https://api.fda.gov/drug/label.json'),
    OPENFDA_TIMEOUT_MS: zod_1.z.coerce.number().int().positive().default(10000),
    RXNORM_BASE_URL: zod_1.z.string().url().default('https://rxnav.nlm.nih.gov/REST'),
    RXNORM_TIMEOUT_MS: zod_1.z.coerce.number().int().positive().default(10000),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:5173'),
    BACKEND_URL: zod_1.z.string().url().default('http://localhost:3001'),
    MAX_FILE_SIZE_MB: zod_1.z.coerce.number().positive().default(10),
    UPLOAD_DIR: zod_1.z.string().default('./uploads'),
    MAX_CALL_RETRIES: zod_1.z.coerce.number().int().positive().default(5),
    RETRY_INTERVAL_MINUTES: zod_1.z.coerce.number().int().positive().default(3)
});
const parsed = exports.EnvSchema.safeParse(process.env);
if (!parsed.success) {
    const details = parsed.error.errors.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map