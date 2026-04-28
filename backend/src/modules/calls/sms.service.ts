import type { ApprovedContact } from '../../types/database';
import type { Language } from '../../types/common';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { buildConfirmedMedicationSMS, buildEmotionalEscalationSMS, buildMissedMedicationSMS } from '../../utils/language';
import { twilioClient } from './twilio.client';

async function sendToContacts(contacts: ApprovedContact[], body: string): Promise<void> {
  await Promise.all(contacts.map(async (contact) => {
    try {
      await twilioClient.sendSms({ to: contact.phone, from: env.TWILIO_PHONE_NUMBER, body });
      logger.info('[SMS] Sent', { contactId: contact.id });
    } catch (error) {
      logger.error('[SMS] Failed', { contactId: contact.id, error: error instanceof Error ? error.message : String(error) });
    }
  }));
}

export const smsService = {
  sendMedicationConfirmedSms(patientName: string, medicineName: string, contacts: ApprovedContact[], language: Language): Promise<void> {
    return sendToContacts(contacts, buildConfirmedMedicationSMS(patientName, medicineName, language));
  },
  sendMedicationMissedSms(patientName: string, medicineName: string, contacts: ApprovedContact[], caregiverName: string): Promise<void> {
    return sendToContacts(contacts, buildMissedMedicationSMS(patientName, medicineName, caregiverName, 'en'));
  },
  sendEmotionalEscalationSms(patientName: string, contacts: ApprovedContact[]): Promise<void> {
    return sendToContacts(contacts, buildEmotionalEscalationSMS(patientName));
  },
  async sendCompanionRequestSms(patientName: string, requestText: string, targetContact: ApprovedContact): Promise<void> {
    await sendToContacts([targetContact], `Saya.ai request from ${patientName}: ${requestText}`);
  }
};