import type { Prescription } from '../../types/database';
import type { UploadedFile } from '../../middleware/upload.middleware';
import type { NerResult } from '../ner/ner.types';
import { DEMO_PRESCRIPTIONS } from '../../data/demoPrescriptions';
import type { PrescriptionWithMedicines, VerifyPrescriptionInput } from './prescription.types';
export declare const prescriptionService: {
    uploadAndProcess(file: UploadedFile, patientId: string, caregiverId: string): Promise<{
        prescription: Prescription;
        nerResult: NerResult;
        ocrText: string;
    }>;
    verifyPrescription(prescriptionId: string, input: VerifyPrescriptionInput, caregiverId: string): Promise<PrescriptionWithMedicines>;
    getPrescription(id: string, caregiverId: string): Promise<PrescriptionWithMedicines>;
    listPrescriptions(patientId: string, caregiverId: string, demo?: boolean): Promise<Prescription[] | typeof DEMO_PRESCRIPTIONS>;
};
//# sourceMappingURL=prescription.service.d.ts.map