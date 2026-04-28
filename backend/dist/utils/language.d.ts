import type { Language } from '../types/common';
export declare function buildMedicationReminderScript(medicineName: string, customMessage: string | null, language: Language): string;
export declare function buildIvrPrompt(language: Language): string;
export declare function buildMissedMedicationSMS(patientName: string, medicineName: string, caregiverName: string, language: Language): string;
export declare function buildConfirmedMedicationSMS(patientName: string, medicineName: string, language: Language): string;
export declare function buildEmotionalEscalationSMS(patientName: string): string;
//# sourceMappingURL=language.d.ts.map