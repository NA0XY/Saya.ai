import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';
import { randomBytes } from 'crypto';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { supabase } from '../../config/supabase';
import type { UploadedFile } from '../../middleware/upload.middleware';
import type { Alert, DemoVital, MedicationSchedule, User } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { dashboardService } from '../dashboard/dashboard.service';
import { demoVitalsService } from '../dashboard/demoVitals.service';
import { medicationService } from '../medications/medication.service';
import { ocrService } from '../ocr/ocr.service';
import { patientRepository } from '../patients/patient.repository';
import { patientService } from '../patients/patient.service';
import { companionService } from '../companion/companion.service';
import type { SentimentTag } from '../../types/common';
import { toE164India } from '../../utils/phone';
import type {
  AlertDto,
  CompanionChatDto,
  FrontendChatInput,
  FrontendOnboardingInput,
  FrontendScheduleInput,
  HealthVitalsDto,
  HealthVitalsQuery,
  MedicineDto,
  SafetyStatusDto,
  UserProfileDto
} from './frontendContract.types';

interface GoogleTokenInfo {
  aud?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  sub?: string;
}

interface GoogleTokenExchangeResponse {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  scope?: string;
  token_type?: string;
}

interface OAuthStatePayload {
  returnTo?: string;
}

const GOOGLE_OAUTH_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_OAUTH_SCOPES = ['openid', 'email', 'profile'];

function sanitizeReturnTo(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (!value.startsWith('/') || value.startsWith('//')) return undefined;
  return value;
}

function signOAuthState(payload: OAuthStatePayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '10m' });
}

function verifyOAuthState(state: string): OAuthStatePayload | null {
  try {
    return jwt.verify(state, env.JWT_SECRET) as OAuthStatePayload;
  } catch {
    return null;
  }
}

function buildGoogleOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URL,
    response_type: 'code',
    scope: GOOGLE_OAUTH_SCOPES.join(' '),
    include_granted_scopes: 'true',
    access_type: 'online',
    prompt: 'select_account',
    state
  });
  return `${GOOGLE_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

async function exchangeGoogleCodeForToken(code: string): Promise<GoogleTokenExchangeResponse> {
  const params = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URL,
    grant_type: 'authorization_code'
  });

  const { data } = await axios.post<GoogleTokenExchangeResponse>(GOOGLE_TOKEN_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 10000
  }).catch((error: unknown) => {
    throw ApiError.badGateway(`Google token exchange failed: ${error instanceof Error ? error.message : String(error)}`);
  });

  return data;
}

function buildFrontendCallbackUrl(params: { token?: string; onboardingComplete?: boolean; returnTo?: string; error?: string }): string {
  const baseUrl = env.FRONTEND_URL.replace(/\/$/, '');
  const url = new URL(`${baseUrl}/auth/callback`);
  const hashParams = new URLSearchParams();
  if (params.token) hashParams.set('token', params.token);
  if (params.onboardingComplete !== undefined) hashParams.set('onboarding', params.onboardingComplete ? '1' : '0');
  if (params.returnTo) hashParams.set('returnTo', params.returnTo);
  if (params.error) hashParams.set('error', params.error);
  url.hash = hashParams.toString();
  return url.toString();
}

function signToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, options);
}

function toUserProfile(user: Pick<User, 'id' | 'email' | 'full_name' | 'role'>, onboardingComplete: boolean): UserProfileDto {
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    onboardingComplete,
    role: user.role === 'caregiver' ? 'caregiver' : 'caregiver'
  };
}

async function getOnboardingComplete(userId: string): Promise<boolean> {
  const patients = await patientRepository.findByCaregiverId(userId);
  return patients.length > 0;
}

async function verifyGoogleToken(token: string): Promise<GoogleTokenInfo> {
  try {
    logger.debug('[GOOGLE_TOKEN] Verifying token');
    const { data } = await axios.get<GoogleTokenInfo>('https://oauth2.googleapis.com/tokeninfo', {
      params: { id_token: token },
      timeout: 5000
    }).catch((error: unknown) => {
      throw ApiError.unauthorized(`Invalid Google token: ${error instanceof Error ? error.message : String(error)}`);
    });

    if (!data.email) throw ApiError.unauthorized('Google token does not include an email');
    if (data.email_verified === false || data.email_verified === 'false') throw ApiError.unauthorized('Google email is not verified');
    if (env.GOOGLE_CLIENT_ID && data.aud !== env.GOOGLE_CLIENT_ID) {
      logger.warn('[GOOGLE_TOKEN] Token audience mismatch', { expected: env.GOOGLE_CLIENT_ID, got: data.aud });
      throw ApiError.unauthorized('Google token audience is not allowed');
    }
    logger.debug('[GOOGLE_TOKEN] Token verified', { email: data.email, aud: data.aud });
    return data;
  } catch (error) {
    logger.error('[GOOGLE_TOKEN] Token verification failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

async function findOrCreateGoogleUser(token: string): Promise<User> {
  try {
    logger.debug('[GOOGLE_USER] Finding or creating user from token');
    const profile = await verifyGoogleToken(token);
    const email = profile.email!.toLowerCase();
    logger.debug('[GOOGLE_USER] Checking for existing user', { email });
    const existing = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (existing.error) {
      logger.error('[GOOGLE_USER] Failed to query users', {
        email,
        code: existing.error.code,
        message: existing.error.message,
        details: existing.error.details,
        hint: existing.error.hint
      });
      if (existing.error.code === 'PGRST205') {
        throw ApiError.internal('Database schema is not initialized. Run Supabase migrations to create public.users.');
      }
      throw ApiError.internal('Failed to load Google user');
    }
    if (existing.data) {
      logger.info('[GOOGLE_USER] Existing user found', { userId: existing.data.id, email });
      return existing.data;
    }

    logger.info('[GOOGLE_USER] Creating new user', { email });
    const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
    const result = await supabase.from('users').insert({
      email,
      password_hash: passwordHash,
      full_name: profile.name ?? email.split('@')[0],
      phone: '+910000000000',
      role: 'caregiver'
    }).select('*').single();
    if (result.error || !result.data) {
      logger.error('[GOOGLE_USER] Failed to create user', {
        email,
        code: result.error?.code,
        message: result.error?.message,
        details: result.error?.details,
        hint: result.error?.hint
      });
      if (result.error?.code === 'PGRST205') {
        throw ApiError.internal('Database schema is not initialized. Run Supabase migrations to create public.users.');
      }
      throw ApiError.internal('Failed to create Google user');
    }
    logger.info('[GOOGLE_USER] New user created', { userId: result.data.id, email });
    return result.data;
  } catch (error) {
    logger.error('[GOOGLE_USER] User find/create failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

async function getPrimaryPatientId(caregiverId: string): Promise<string> {
  const patients = await patientRepository.findByCaregiverId(caregiverId);
  const patient = patients[0];
  if (!patient) throw ApiError.badRequest('Create a patient before using this endpoint');
  return patient.id;
}

function normalizeScheduleTime(time: string): string {
  const clock = time.match(/^(\d{1,2}):([0-5]\d)$/);
  if (clock) return `${clock[1].padStart(2, '0')}:${clock[2]}`;

  const parsed = new Date(time);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getHours().toString().padStart(2, '0')}:${parsed.getMinutes().toString().padStart(2, '0')}`;
  }

  throw ApiError.badRequest('time must be HH:mm or an ISO date-time string');
}

function toMedicineDto(medicine: { drug_name: string; dosage: string | null; frequency: string | null; low_confidence: boolean }, index: number): MedicineDto {
  return {
    id: `${medicine.drug_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'medicine'}-${index + 1}`,
    drugName: medicine.drug_name,
    dosage: medicine.dosage ?? '',
    frequency: medicine.frequency ?? '',
    confidence: medicine.low_confidence ? 'low' : 'high'
  };
}

function toAlertDto(alert: Alert): AlertDto {
  const isMedication = alert.alert_type === 'missed_medication';
  const isHealth = alert.alert_type === 'emotional_escalation';
  return {
    id: alert.id,
    type: isMedication ? 'medication' : isHealth ? 'health' : 'safety',
    severity: alert.resolved ? 'low' : isMedication || isHealth ? 'high' : 'medium',
    message: alert.message,
    timestamp: alert.created_at
  };
}

function toVitalsStatus(heartRate: Array<{ value: number }>): HealthVitalsDto['vitalsStatus'] {
  if (heartRate.some((reading) => reading.value < 45 || reading.value > 130)) return 'critical';
  if (heartRate.some((reading) => reading.value < 55 || reading.value > 110)) return 'warning';
  return 'stable';
}

function filterVitalsByRange(vitals: DemoVital[], range: HealthVitalsQuery['range']): DemoVital[] {
  if (!range) return vitals;
  const days = range === '7d' ? 7 : 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return vitals.filter((vital) => new Date(vital.recorded_at).getTime() >= cutoff);
}

function toMood(sentiment: SentimentTag): CompanionChatDto['mood'] {
  if (sentiment === 'joy') return 'happy';
  if (sentiment === 'anxiety' || sentiment === 'sadness') return 'concerned';
  return 'neutral';
}

export const frontendContractService = {
  async startGoogleOAuth(returnTo?: string): Promise<string> {
    const state = signOAuthState({ returnTo: sanitizeReturnTo(returnTo) });
    return buildGoogleOAuthUrl(state);
  },

  async handleGoogleOAuthCallback(query: {
    code?: string;
    state?: string;
    error?: string;
    error_description?: string;
  }): Promise<string> {
    if (query.error) {
      logger.warn('[AUTH] Google OAuth denied', { error: query.error, description: query.error_description });
      return buildFrontendCallbackUrl({ error: query.error });
    }

    if (!query.state) {
      return buildFrontendCallbackUrl({ error: 'missing_state' });
    }

    const statePayload = verifyOAuthState(query.state);
    if (!statePayload) {
      return buildFrontendCallbackUrl({ error: 'invalid_state' });
    }

    if (!query.code) {
      return buildFrontendCallbackUrl({ error: 'missing_code', returnTo: sanitizeReturnTo(statePayload.returnTo) });
    }

    try {
      const tokenResponse = await exchangeGoogleCodeForToken(query.code);
      if (!tokenResponse.id_token) {
        return buildFrontendCallbackUrl({ error: 'missing_id_token', returnTo: sanitizeReturnTo(statePayload.returnTo) });
      }

      const user = await findOrCreateGoogleUser(tokenResponse.id_token);
      const onboardingComplete = await getOnboardingComplete(user.id);
      const token = signToken(user);
      return buildFrontendCallbackUrl({
        token,
        onboardingComplete,
        returnTo: sanitizeReturnTo(statePayload.returnTo)
      });
    } catch (error) {
      logger.error('[AUTH] Google OAuth callback failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return buildFrontendCallbackUrl({ error: 'oauth_failed', returnTo: sanitizeReturnTo(statePayload.returnTo) });
    }
  },

  async authenticateWithGoogle(token: string): Promise<{ user: UserProfileDto; token: string }> {
    try {
      logger.info('[AUTH] Google authentication attempt');
      const user = await findOrCreateGoogleUser(token);
      logger.info('[AUTH] Google user found or created', { userId: user.id, email: user.email });
      const onboardingComplete = await getOnboardingComplete(user.id);
      const jwtToken = signToken(user);
      logger.info('[AUTH] Google authentication successful', { userId: user.id });
      return { user: toUserProfile(user, onboardingComplete), token: jwtToken };
    } catch (error) {
      logger.error('[AUTH] Google authentication failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  async getProfile(userId: string): Promise<UserProfileDto> {
    const result = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    if (result.error) throw ApiError.internal('Failed to load user profile');
    if (!result.data) throw ApiError.notFound('User');
    return toUserProfile(result.data, await getOnboardingComplete(userId));
  },

  async submitOnboarding(userId: string, input: FrontendOnboardingInput): Promise<{ status: string }> {
    const patients = await patientRepository.findByCaregiverId(userId);
    const primaryPatient = patients[0];
    if (primaryPatient) {
      await patientRepository.update(primaryPatient.id, {
        companion_tone: input.personality,
        language_preference: input.language === 'hindi' ? 'hi' : 'en'
      });
    } else {
      const firstContact = input.contacts[0];
      const patient = await patientRepository.create({
        caregiver_id: userId,
        full_name: 'Primary Elder',
        phone: toE164India(firstContact.phone),
        date_of_birth: null,
        companion_tone: input.personality,
        language_preference: input.language === 'hindi' ? 'hi' : 'en'
      });
      for (const contact of input.contacts) {
        await patientRepository.createContact({
          patient_id: patient.id,
          name: contact.name,
          phone: toE164India(contact.phone),
          relationship: 'family',
          can_receive_escalation_sms: true
        });
      }
    }
    return { status: 'success' };
  },

  async getSafetyStatuses(caregiverId: string): Promise<SafetyStatusDto[]> {
    const data = await dashboardService.getDashboardData(caregiverId);
    const unresolvedAlerts = data.recentAlerts.filter((alert) => !alert.resolved);
    const medicationAlerts = unresolvedAlerts.filter((alert) => alert.alert_type === 'missed_medication');
    const healthAlerts = unresolvedAlerts.filter((alert) => alert.alert_type === 'emotional_escalation');
    return [
      {
        title: 'Medication adherence',
        status: medicationAlerts.length > 0 ? 'Needs attention' : 'On track',
        statusColor: medicationAlerts.length > 0 ? 'orange' : 'green',
        icon: 'pill',
        description: medicationAlerts.length > 0 ? `${medicationAlerts.length} medication alert${medicationAlerts.length === 1 ? '' : 's'} pending` : `${data.activeSchedules.length} active reminder${data.activeSchedules.length === 1 ? '' : 's'}`
      },
      {
        title: 'Emotional wellbeing',
        status: healthAlerts.length > 0 ? 'Check in soon' : 'Stable',
        statusColor: healthAlerts.length > 0 ? 'orange' : 'green',
        icon: 'heart',
        description: healthAlerts.length > 0 ? 'Recent companion chat indicates concern' : 'No unresolved emotional alerts'
      },
      {
        title: 'Care network',
        status: data.patients.length > 0 ? 'Connected' : 'Setup needed',
        statusColor: data.patients.length > 0 ? 'blue' : 'orange',
        icon: 'users',
        description: data.patients.length > 0 ? `${data.patients.length} elder profile${data.patients.length === 1 ? '' : 's'} monitored` : 'Add an elder profile to start monitoring'
      }
    ];
  },

  async getAlerts(caregiverId: string): Promise<AlertDto[]> {
    const data = await dashboardService.getDashboardData(caregiverId);
    return data.recentAlerts.map(toAlertDto);
  },

  async getHealthVitals(caregiverId: string, query: HealthVitalsQuery): Promise<HealthVitalsDto> {
    const patients = await patientRepository.findByCaregiverId(caregiverId);
    const patient = patients[0];
    if (!patient) return { heartRate: [], steps: [], vitalsStatus: 'stable' };

    const vitals = filterVitalsByRange(await demoVitalsService.getDemoVitals(patient.id), query.range);
    const heartRate = vitals
      .filter((vital) => vital.metric === 'heart_rate')
      .map((vital) => ({ date: vital.recorded_at, value: vital.value }));
    return { heartRate, steps: [], vitalsStatus: toVitalsStatus(heartRate) };
  },

  async extractMedicines(file?: UploadedFile): Promise<{ medicines: MedicineDto[] }> {
    if (!file) throw ApiError.badRequest('image is required');
    try {
      const { nerResult } = await ocrService.processPrescritionImage(file.path, file.mimetype);
      return { medicines: nerResult.medicines.map(toMedicineDto) };
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  },

  async scheduleMedication(input: FrontendScheduleInput, caregiverId: string): Promise<{ id: string; status: string }> {
    const schedule: MedicationSchedule = await medicationService.createSchedule({
      patient_id: await getPrimaryPatientId(caregiverId),
      medicine_name: input.drugName,
      scheduled_time: normalizeScheduleTime(input.time),
      custom_message: input.customMessage,
      language: 'en'
    }, caregiverId);
    return { id: schedule.id, status: schedule.active ? 'scheduled' : 'inactive' };
  },

  async chat(input: FrontendChatInput, caregiverId: string): Promise<CompanionChatDto> {
    const patientId = await getPrimaryPatientId(caregiverId);
    await patientService.assertCaregiverOwnsPatient(patientId, caregiverId);
    const response = await companionService.chat({ patient_id: patientId, message: input.message, language: 'en' }, caregiverId);
    return { response: response.reply, mood: toMood(response.sentiment), actions: [] };
  }
};
