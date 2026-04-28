"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emotionalEscalationJob = emotionalEscalationJob;
const node_cron_1 = __importDefault(require("node-cron"));
const supabase_1 = require("../config/supabase");
const logger_1 = require("../config/logger");
const alert_service_1 = require("../modules/alerts/alert.service");
const patient_repository_1 = require("../modules/patients/patient.repository");
const sms_service_1 = require("../modules/calls/sms.service");
function emotionalEscalationJob() {
    return node_cron_1.default.schedule('0 * * * *', async () => {
        try {
            const { data: patients, error } = await supabase_1.supabase.from('patients').select('*');
            if (error)
                throw error;
            for (const patient of patients ?? []) {
                const { data: messages } = await supabase_1.supabase.from('companion_messages').select('*').eq('patient_id', patient.id).eq('role', 'user').order('created_at', { ascending: false }).limit(2);
                const persistent = (messages ?? []).length === 2 && (messages ?? []).every((message) => message.sentiment === 'sadness' || message.sentiment === 'anxiety');
                if (persistent && !(await alert_service_1.alertService.hasRecentEmotionalEscalation(patient.id))) {
                    const contacts = await patient_repository_1.patientRepository.findEscalationContacts(patient.id);
                    await sms_service_1.smsService.sendEmotionalEscalationSms(patient.full_name, contacts);
                    await alert_service_1.alertService.createAlert({ patient_id: patient.id, caregiver_id: patient.caregiver_id, alert_type: 'emotional_escalation', message: `${patient.full_name} has persistent sad or anxious messages` });
                }
            }
        }
        catch (error) {
            logger_1.logger.error('[JOB] Emotional escalation sweep failed', { error: error instanceof Error ? error.message : String(error) });
        }
    });
}
//# sourceMappingURL=emotionalEscalation.job.js.map