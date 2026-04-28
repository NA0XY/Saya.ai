"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = void 0;
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const language_1 = require("../../utils/language");
const twilio_client_1 = require("./twilio.client");
async function sendToContacts(contacts, body) {
    await Promise.all(contacts.map(async (contact) => {
        try {
            await twilio_client_1.twilioClient.sendSms({ to: contact.phone, from: env_1.env.TWILIO_PHONE_NUMBER, body });
            logger_1.logger.info('[SMS] Sent', { contactId: contact.id });
        }
        catch (error) {
            logger_1.logger.error('[SMS] Failed', { contactId: contact.id, error: error instanceof Error ? error.message : String(error) });
        }
    }));
}
exports.smsService = {
    sendMedicationConfirmedSms(patientName, medicineName, contacts, language) {
        return sendToContacts(contacts, (0, language_1.buildConfirmedMedicationSMS)(patientName, medicineName, language));
    },
    sendMedicationMissedSms(patientName, medicineName, contacts, caregiverName) {
        return sendToContacts(contacts, (0, language_1.buildMissedMedicationSMS)(patientName, medicineName, caregiverName, 'en'));
    },
    sendIntentionalRefusalSms(patientName, medicineName, contacts, caregiverName) {
        return sendToContacts(contacts, (0, language_1.buildIntentionalRefusalSMS)(patientName, medicineName, caregiverName, 'en'));
    },
    sendEmotionalEscalationSms(patientName, contacts) {
        return sendToContacts(contacts, (0, language_1.buildEmotionalEscalationSMS)(patientName));
    },
    async sendCompanionRequestSms(patientName, requestText, targetContact) {
        await sendToContacts([targetContact], `Saya.ai request from ${patientName}: ${requestText}`);
    }
};
//# sourceMappingURL=sms.service.js.map