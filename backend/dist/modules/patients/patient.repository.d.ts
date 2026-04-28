import type { ApprovedContact, Patient } from '../../types/database';
import type { PatientWithContacts } from './patient.types';
export declare const patientRepository: {
    findById(id: string): Promise<Patient | null>;
    findByIdWithContacts(id: string): Promise<PatientWithContacts | null>;
    findByCaregiverId(caregiverId: string): Promise<Patient[]>;
    create(data: Omit<Patient, "id" | "created_at" | "updated_at">): Promise<Patient>;
    update(id: string, data: Partial<Patient>): Promise<Patient>;
    delete(id: string): Promise<void>;
    createContact(data: Omit<ApprovedContact, "id" | "created_at">): Promise<ApprovedContact>;
    findContactsByPatientId(patientId: string): Promise<ApprovedContact[]>;
    findEscalationContacts(patientId: string): Promise<ApprovedContact[]>;
};
//# sourceMappingURL=patient.repository.d.ts.map