import type { Alert } from '../../types/database';
import type { AlertWithPatient, CreateAlertInput } from './alert.types';
export declare const alertRepository: {
    create(data: CreateAlertInput): Promise<Alert>;
    findByPatientId(patientId: string, includeResolved?: boolean): Promise<Alert[]>;
    findByCaregiverId(caregiverId: string, limit?: number): Promise<AlertWithPatient[]>;
    resolve(id: string): Promise<void>;
    markSmsSent(id: string): Promise<void>;
};
//# sourceMappingURL=alert.repository.d.ts.map