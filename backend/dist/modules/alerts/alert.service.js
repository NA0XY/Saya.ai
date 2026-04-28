"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertService = void 0;
const apiError_1 = require("../../utils/apiError");
const patient_repository_1 = require("../patients/patient.repository");
const alert_repository_1 = require("./alert.repository");
exports.alertService = {
    createAlert(input) {
        return alert_repository_1.alertRepository.create(input);
    },
    async resolveAlert(id, caregiverId) {
        const alerts = await alert_repository_1.alertRepository.findByCaregiverId(caregiverId, 100);
        if (!alerts.some((alert) => alert.id === id))
            throw apiError_1.ApiError.forbidden('You do not have access to this alert');
        await alert_repository_1.alertRepository.resolve(id);
    },
    getAlertsForCaregiver(caregiverId) {
        return alert_repository_1.alertRepository.findByCaregiverId(caregiverId);
    },
    async hasRecentEmotionalEscalation(patientId) {
        const patient = await patient_repository_1.patientRepository.findById(patientId);
        if (!patient)
            return false;
        const alerts = await alert_repository_1.alertRepository.findByPatientId(patientId, true);
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        return alerts.some((alert) => alert.alert_type === 'emotional_escalation' && new Date(alert.created_at).getTime() >= cutoff);
    }
};
//# sourceMappingURL=alert.service.js.map