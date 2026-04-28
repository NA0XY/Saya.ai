import { z } from 'zod';

export const GoogleAuthSchema = z.object({
  token: z.string().min(1)
});

export const FrontendOnboardingSchema = z.object({
  contacts: z.array(z.object({
    name: z.string().min(1),
    phone: z.string().min(1)
  })).min(1),
  personality: z.enum(['warm', 'formal', 'playful']),
  language: z.enum(['english', 'hindi'])
});

export const HealthVitalsQuerySchema = z.object({
  range: z.enum(['7d', '30d']).optional()
});

export const FrontendScheduleSchema = z.object({
  drugName: z.string().min(1),
  time: z.string().min(1),
  customMessage: z.string().optional()
});

export const FrontendChatSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    lastMood: z.string().optional(),
    location: z.string().optional()
  }).optional()
});

export type GoogleAuthInput = z.infer<typeof GoogleAuthSchema>;
export type FrontendOnboardingInput = z.infer<typeof FrontendOnboardingSchema>;
export type HealthVitalsQuery = z.infer<typeof HealthVitalsQuerySchema>;
export type FrontendScheduleInput = z.infer<typeof FrontendScheduleSchema>;
export type FrontendChatInput = z.infer<typeof FrontendChatSchema>;

export interface UserProfileDto {
  id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
  role: 'caregiver' | 'parent';
}

export interface SafetyStatusDto {
  title: string;
  status: string;
  statusColor: 'green' | 'orange' | 'red' | 'blue';
  icon: string;
  description: string;
}

export interface AlertDto {
  id: string;
  type: 'medication' | 'safety' | 'health';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
}

export interface MedicineDto {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  confidence: 'high' | 'low';
}

export interface HealthVitalsDto {
  heartRate: Array<{ date: string; value: number }>;
  steps: Array<{ date: string; value: number }>;
  vitalsStatus: 'stable' | 'warning' | 'critical';
}

export interface CompanionChatDto {
  response: string;
  mood: 'neutral' | 'happy' | 'concerned';
  actions: Array<{ type: 'call_family' | 'reminder'; data: Record<string, unknown> }>;
}
