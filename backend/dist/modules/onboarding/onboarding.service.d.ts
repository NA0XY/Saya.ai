import type { Patient } from '../../types/database';
import type { OnboardingInput } from './onboarding.types';
export declare const onboardingService: {
    createPatientWithContacts(caregiverId: string, input: OnboardingInput): Promise<Patient>;
    getPatient(patientId: string, caregiverId: string): Promise<import("../patients/patient.types").PatientWithContacts>;
    listPatients(caregiverId: string): Promise<Patient[]>;
    updatePatient(patientId: string, caregiverId: string, updates: Partial<OnboardingInput>): Promise<Patient>;
};
//# sourceMappingURL=onboarding.service.d.ts.map