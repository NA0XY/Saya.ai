import type { Alert, CallLog, MedicationSchedule, Patient } from '../../types/database';
import type { PatientSummary } from '../patients/patient.types';
export interface DashboardData {
    patients: PatientSummary[];
    recentAlerts: Alert[];
    activeSchedules: MedicationSchedule[];
    recentCallLogs: CallLog[];
}
export interface PatientDashboardData {
    patient: Patient;
    prescriptions: unknown[];
    schedules: MedicationSchedule[];
    callLogs: CallLog[];
    companionMessageCount: number;
    vitals: unknown[];
}
export declare const dashboardService: {
    getDashboardData(caregiverId: string, demo?: boolean): Promise<DashboardData>;
    getPatientDashboard(patientId: string, caregiverId: string, demo?: boolean): Promise<PatientDashboardData>;
};
//# sourceMappingURL=dashboard.service.d.ts.map