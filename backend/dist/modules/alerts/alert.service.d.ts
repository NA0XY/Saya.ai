import type { AlertWithPatient, CreateAlertInput } from './alert.types';
import type { Alert } from '../../types/database';
export declare const alertService: {
    createAlert(input: CreateAlertInput): Promise<Alert>;
    resolveAlert(id: string, caregiverId: string): Promise<void>;
    getAlertsForCaregiver(caregiverId: string): Promise<AlertWithPatient[]>;
    hasRecentEmotionalEscalation(patientId: string): Promise<boolean>;
};
//# sourceMappingURL=alert.service.d.ts.map