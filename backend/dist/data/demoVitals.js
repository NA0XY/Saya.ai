"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_VITALS = void 0;
const date_fns_1 = require("date-fns");
const patientId = 'demo-patient-uuid';
const metrics = [
    { metric: 'blood_pressure_systolic', min: 115, max: 145, unit: 'mmHg' },
    { metric: 'blood_pressure_diastolic', min: 75, max: 90, unit: 'mmHg' },
    { metric: 'heart_rate', min: 62, max: 85, unit: 'bpm' },
    { metric: 'blood_sugar', min: 95, max: 180, unit: 'mg/dL' },
    { metric: 'spo2', min: 95, max: 99, unit: '%' }
];
function deterministicValue(day, index, min, max) {
    const span = max - min;
    const wave = Math.sin((day + 1) * (index + 2)) * 0.5 + 0.5;
    return Math.round(min + wave * span);
}
exports.DEMO_VITALS = Array.from({ length: 30 }).flatMap((_, day) => metrics.map((item, index) => ({
    id: `demo-vital-${day}-${item.metric}`,
    patient_id: patientId,
    metric: item.metric,
    value: deterministicValue(day, index, item.min, item.max),
    unit: item.unit,
    recorded_at: (0, date_fns_1.subDays)(new Date(), 29 - day).toISOString()
})));
//# sourceMappingURL=demoVitals.js.map