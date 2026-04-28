import type { Medicine, Prescription } from '../../types/database';
import type { PrescriptionWithMedicines } from './prescription.types';
type PrescriptionCreate = Omit<Prescription, 'id' | 'created_at'>;
export declare const prescriptionRepository: {
    create(data: PrescriptionCreate): Promise<Prescription>;
    findById(id: string): Promise<Prescription | null>;
    findByIdWithMedicines(id: string): Promise<PrescriptionWithMedicines | null>;
    findByPatientId(patientId: string): Promise<Prescription[]>;
    update(id: string, data: Partial<Prescription>): Promise<Prescription>;
    delete(id: string): Promise<void>;
    createMedicines(medicines: Omit<Medicine, "id" | "created_at">[]): Promise<Medicine[]>;
    markVerified(id: string, verifiedBy: string, medicines: Omit<Medicine, "id" | "created_at">[]): Promise<PrescriptionWithMedicines>;
};
export {};
//# sourceMappingURL=prescription.repository.d.ts.map