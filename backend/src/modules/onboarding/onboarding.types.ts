import { z } from 'zod';

export const CreatePatientSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(10),
  date_of_birth: z.string().optional(),
  language_preference: z.enum(['hi', 'en']).default('hi'),
  companion_tone: z.enum(['warm', 'formal', 'playful']).default('warm')
});

export const CreateContactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  relationship: z.string().min(2),
  can_receive_escalation_sms: z.boolean().optional().default(true)
});

export const OnboardingSchema = CreatePatientSchema.extend({
  contacts: z.array(CreateContactSchema).min(1).max(5)
});

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;
export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type OnboardingInput = z.infer<typeof OnboardingSchema>;
