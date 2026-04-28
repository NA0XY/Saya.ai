import type { ApprovedContact, Patient } from '../../types/database';
export type PatientWithContacts = Patient & {
    approved_contacts: ApprovedContact[];
};
export type PatientSummary = Pick<Patient, 'id' | 'full_name' | 'phone' | 'language_preference' | 'companion_tone'>;
//# sourceMappingURL=patient.types.d.ts.map