import type { ApprovedContact, Patient } from '../../types/database';
import type { PatientWithContacts } from './patient.types';
export declare const patientService: {
    assertCaregiverOwnsPatient(patientId: string, caregiverId: string): Promise<void>;
    getPatient(patientId: string, caregiverId: string): Promise<PatientWithContacts>;
    listPatients(caregiverId: string): Promise<Patient[]>;
    getContacts(patientId: string, caregiverId: string): Promise<ApprovedContact[]>;
};
//# sourceMappingURL=patient.service.d.ts.map