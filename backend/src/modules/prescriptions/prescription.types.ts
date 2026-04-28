import { z } from 'zod';
import type { Medicine, Prescription } from '../../types/database';

export type PrescriptionWithMedicines = Prescription & { medicines: Medicine[] };

export const VerifyPrescriptionSchema = z.object({
  medicines: z.array(z.object({
    drug_name: z.string().min(1),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    route: z.string().optional()
  })).min(1)
});

export type VerifyPrescriptionInput = z.infer<typeof VerifyPrescriptionSchema>;
