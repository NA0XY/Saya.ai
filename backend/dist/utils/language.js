"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMedicationReminderScript = buildMedicationReminderScript;
exports.buildIvrPrompt = buildIvrPrompt;
exports.buildMissedMedicationSMS = buildMissedMedicationSMS;
exports.buildIntentionalRefusalSMS = buildIntentionalRefusalSMS;
exports.buildConfirmedMedicationSMS = buildConfirmedMedicationSMS;
exports.buildEmotionalEscalationSMS = buildEmotionalEscalationSMS;
function buildMedicationReminderScript(medicineName, customMessage, language) {
    const base = language === 'hi'
        ? `Namaste. Yeh aapke parivaar ki taraf se ek yaad dilaane ki call hai. Abhi apni ${medicineName} ki goli lijiye.`
        : `Hello. This is a reminder call from your family. Please take your ${medicineName} medicine now.`;
    return customMessage ? `${base} ${customMessage}` : base;
}
function buildIvrPrompt(language) {
    return language === 'hi'
        ? 'Kya aapne apni dawai le li? Haan ke liye 1 dabaiye, nahi ke liye 2 dabaiye.'
        : 'Have you taken your medicine? Press 1 for yes, or 2 for no.';
}
function buildMissedMedicationSMS(patientName, medicineName, caregiverName, language) {
    return language === 'hi'
        ? `Saya.ai alert: ${patientName} ne ${medicineName} ke reminder call ka jawab nahi diya. Kripya turant check karein. - ${caregiverName}`
        : `Saya.ai alert: ${patientName} did not answer the reminder calls for ${medicineName}. Please check on them urgently. - ${caregiverName}`;
}
function buildIntentionalRefusalSMS(patientName, medicineName, caregiverName, language) {
    return language === 'hi'
        ? `Saya.ai alert: ${patientName} ne jaanboojhkar ${medicineName} nahi liya. Kripya unse baat karein. - ${caregiverName}`
        : `Saya.ai alert: ${patientName} intentionally did not take ${medicineName}. Please talk to them. - ${caregiverName}`;
}
function buildConfirmedMedicationSMS(patientName, medicineName, language) {
    return language === 'hi'
        ? `Saya.ai update: ${patientName} ne confirm kiya hai ki unhone ${medicineName} le li hai.`
        : `Saya.ai update: ${patientName} confirmed they have taken ${medicineName}.`;
}
function buildEmotionalEscalationSMS(patientName) {
    return `Saya.ai gentle alert: ${patientName} has sounded sad or anxious in two recent messages. Please check in when you can.`;
}
//# sourceMappingURL=language.js.map