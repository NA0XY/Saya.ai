import type { ApprovedContact } from '../../types/database';
import type { Language } from '../../types/common';
export declare const smsService: {
    sendMedicationConfirmedSms(patientName: string, medicineName: string, contacts: ApprovedContact[], language: Language): Promise<void>;
    sendMedicationMissedSms(patientName: string, medicineName: string, contacts: ApprovedContact[], caregiverName: string): Promise<void>;
    sendEmotionalEscalationSms(patientName: string, contacts: ApprovedContact[]): Promise<void>;
    sendCompanionRequestSms(patientName: string, requestText: string, targetContact: ApprovedContact): Promise<void>;
};
//# sourceMappingURL=sms.service.d.ts.map