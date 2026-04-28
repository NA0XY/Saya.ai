import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_OAUTH_REDIRECT_URL: z.string().url(),
  AWS_ACCESS_KEY_ID: z.string().optional().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(''),
  AWS_REGION: z.string().optional().default('ap-south-1'),
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(1),
  NEWS_API_KEY: z.string().min(1),
  GROQ_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  GOOGLE_VISION_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  TWILIO_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  POLLY_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  NEWS_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  COMPANION_STT_PROVIDER: z.enum(['local_faster_whisper', 'groq_whisper']).default('groq_whisper'),
  LOCAL_STT_URL: z.string().url().default('http://127.0.0.1:7001'),
  LOCAL_STT_TIMEOUT_MS: z.coerce.number().int().positive().default(12000),
  COMPANION_TTS_PROVIDER: z.enum(['piper', 'google']).default('piper'),
  PIPER_BINARY_PATH: z.string().optional().default(''),
  PIPER_MODEL_EN_PATH: z.string().optional().default(''),
  PIPER_CONFIG_EN_PATH: z.string().optional().default(''),
  PIPER_HTTP_DEBUG_ENABLED: z.string().optional().default('false'),
  OPENFDA_API_KEY: z.string().optional().default(''),
  OPENFDA_LABEL_URL: z.string().url().default('https://api.fda.gov/drug/label.json'),
  OPENFDA_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  RXNORM_BASE_URL: z.string().url().default('https://rxnav.nlm.nih.gov/REST'),
  RXNORM_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  BACKEND_URL: z.string().url().default('http://localhost:3001'),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(10),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_CALL_RETRIES: z.coerce.number().int().positive().default(5),
  RETRY_INTERVAL_MINUTES: z.coerce.number().int().positive().default(3)
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.errors.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env: Env = parsed.data;
