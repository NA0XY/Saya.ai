import { ApiError } from '../../utils/apiError';
import { patientRepository } from '../patients/patient.repository';
import { alertRepository } from './alert.repository';
import type { AlertWithPatient, CreateAlertInput } from './alert.types';
import type { Alert } from '../../types/database';

export const alertService = {
  createAlert(input: CreateAlertInput): Promise<Alert> {
    return alertRepository.create(input);
  },
  async resolveAlert(id: string, caregiverId: string): Promise<void> {
    const alerts = await alertRepository.findByCaregiverId(caregiverId, 100);
    if (!alerts.some((alert) => alert.id === id)) throw ApiError.forbidden('You do not have access to this alert');
    await alertRepository.resolve(id);
  },
  getAlertsForCaregiver(caregiverId: string): Promise<AlertWithPatient[]> {
    return alertRepository.findByCaregiverId(caregiverId);
  },
  async hasRecentEmotionalEscalation(patientId: string): Promise<boolean> {
    const patient = await patientRepository.findById(patientId);
    if (!patient) return false;
    const alerts = await alertRepository.findByPatientId(patientId, true);
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return alerts.some((alert) => alert.alert_type === 'emotional_escalation' && new Date(alert.created_at).getTime() >= cutoff);
  }
};
