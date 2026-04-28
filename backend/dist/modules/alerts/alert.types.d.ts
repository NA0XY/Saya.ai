import type { Alert, Patient } from '../../types/database';
export interface CreateAlertInput {
    patient_id: string;
    caregiver_id: string;
    alert_type: Alert['alert_type'];
    message: string;
}
export type AlertWithPatient = Alert & {
    patient: Pick<Patient, 'full_name' | 'phone'>;
};
//# sourceMappingURL=alert.types.d.ts.map