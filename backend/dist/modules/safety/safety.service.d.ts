import type { DrugInteraction } from '../../types/database';
import type { SafetyReport } from './safety.types';
export declare const safetyService: {
    generateSafetyReport(prescriptionId: string): Promise<SafetyReport>;
    formatInteractionWarnings(interactions: DrugInteraction[], _drugNames: string[]): Promise<string>;
    getSafetyReportForPrescription(prescriptionId: string, caregiverId: string): Promise<SafetyReport>;
    checkDrugs(drugNames: string[]): Promise<SafetyReport>;
    demoReport(prescriptionId: string): Promise<SafetyReport>;
};
//# sourceMappingURL=safety.service.d.ts.map