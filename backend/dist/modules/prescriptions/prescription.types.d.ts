import { z } from 'zod';
import type { Medicine, Prescription } from '../../types/database';
export type PrescriptionWithMedicines = Prescription & {
    medicines: Medicine[];
};
export declare const VerifyPrescriptionSchema: z.ZodObject<{
    medicines: z.ZodArray<z.ZodObject<{
        drug_name: z.ZodString;
        dosage: z.ZodOptional<z.ZodString>;
        frequency: z.ZodOptional<z.ZodString>;
        route: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        drug_name: string;
        route?: string | undefined;
        dosage?: string | undefined;
        frequency?: string | undefined;
    }, {
        drug_name: string;
        route?: string | undefined;
        dosage?: string | undefined;
        frequency?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    medicines: {
        drug_name: string;
        route?: string | undefined;
        dosage?: string | undefined;
        frequency?: string | undefined;
    }[];
}, {
    medicines: {
        drug_name: string;
        route?: string | undefined;
        dosage?: string | undefined;
        frequency?: string | undefined;
    }[];
}>;
export type VerifyPrescriptionInput = z.infer<typeof VerifyPrescriptionSchema>;
//# sourceMappingURL=prescription.types.d.ts.map