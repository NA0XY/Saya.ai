"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const supabase_1 = require("../../config/supabase");
const demoPrescriptions_1 = require("../../data/demoPrescriptions");
const apiError_1 = require("../../utils/apiError");
const alert_repository_1 = require("../alerts/alert.repository");
const medication_repository_1 = require("../medications/medication.repository");
const patient_repository_1 = require("../patients/patient.repository");
const prescription_repository_1 = require("../prescriptions/prescription.repository");
const demoVitals_service_1 = require("./demoVitals.service");
const demoPatient = { id: 'demo-patient-uuid', caregiver_id: 'demo-caregiver-uuid', full_name: 'Ramesh Kumar', phone: '+919876543210', date_of_birth: '1948-01-01', language_preference: 'hi', companion_tone: 'warm', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
exports.dashboardService = {
    async getDashboardData(caregiverId, demo = false) {
        if (demo)
            return { patients: [demoPatient], recentAlerts: [], activeSchedules: [], recentCallLogs: [] };
        const patients = await patient_repository_1.patientRepository.findByCaregiverId(caregiverId);
        const recentAlerts = await alert_repository_1.alertRepository.findByCaregiverId(caregiverId, 5);
        const activeSchedules = (await Promise.all(patients.map((patient) => medication_repository_1.medicationRepository.findSchedulesByPatient(patient.id)))).flat();
        const { data, error } = await supabase_1.supabase.from('call_logs').select('*').in('patient_id', patients.map((p) => p.id)).order('created_at', { ascending: false }).limit(10);
        if (error)
            throw apiError_1.ApiError.internal('Failed to load call logs');
        return { patients, recentAlerts, activeSchedules, recentCallLogs: data ?? [] };
    },
    async getPatientDashboard(patientId, caregiverId, demo = false) {
        if (demo || patientId === 'demo-patient-uuid')
            return { patient: demoPatient, prescriptions: demoPrescriptions_1.DEMO_PRESCRIPTIONS, schedules: [], callLogs: [], companionMessageCount: 0, vitals: await demoVitals_service_1.demoVitalsService.getDemoVitals(patientId) };
        const patient = await patient_repository_1.patientRepository.findById(patientId);
        if (!patient)
            throw apiError_1.ApiError.notFound('Patient');
        if (patient.caregiver_id !== caregiverId)
            throw apiError_1.ApiError.forbidden('You do not have access to this patient');
        const [prescriptions, schedules, vitals, countResult] = await Promise.all([
            prescription_repository_1.prescriptionRepository.findByPatientId(patientId),
            medication_repository_1.medicationRepository.findSchedulesByPatient(patientId),
            demoVitals_service_1.demoVitalsService.getDemoVitals(patientId),
            supabase_1.supabase.from('companion_messages').select('*', { count: 'exact', head: true }).eq('patient_id', patientId)
        ]);
        const logs = (await Promise.all(schedules.map((schedule) => medication_repository_1.medicationRepository.findCallLogsBySchedule(schedule.id)))).flat();
        return { patient, prescriptions, schedules, callLogs: logs, companionMessageCount: countResult.count ?? 0, vitals };
    }
};
//# sourceMappingURL=dashboard.service.js.map