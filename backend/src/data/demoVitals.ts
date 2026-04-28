import { subDays } from 'date-fns';
import type { DemoVital } from '../types/database';

const patientId = 'demo-patient-uuid';
const metrics: Array<{ metric: DemoVital['metric']; min: number; max: number; unit: string }> = [
  { metric: 'blood_pressure_systolic', min: 115, max: 145, unit: 'mmHg' },
  { metric: 'blood_pressure_diastolic', min: 75, max: 90, unit: 'mmHg' },
  { metric: 'heart_rate', min: 62, max: 85, unit: 'bpm' },
  { metric: 'blood_sugar', min: 95, max: 180, unit: 'mg/dL' },
  { metric: 'spo2', min: 95, max: 99, unit: '%' }
];

function deterministicValue(day: number, index: number, min: number, max: number): number {
  const span = max - min;
  const wave = Math.sin((day + 1) * (index + 2)) * 0.5 + 0.5;
  return Math.round(min + wave * span);
}

export const DEMO_VITALS: DemoVital[] = Array.from({ length: 30 }).flatMap((_, day) =>
  metrics.map((item, index) => ({
    id: `demo-vital-${day}-${item.metric}`,
    patient_id: patientId,
    metric: item.metric,
    value: deterministicValue(day, index, item.min, item.max),
    unit: item.unit,
    recorded_at: subDays(new Date(), 29 - day).toISOString()
  }))
);
