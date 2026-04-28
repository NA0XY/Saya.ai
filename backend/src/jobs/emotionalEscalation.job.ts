import cron, { ScheduledTask } from 'node-cron';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';
import { alertService } from '../modules/alerts/alert.service';
import { patientRepository } from '../modules/patients/patient.repository';
import { smsService } from '../modules/calls/sms.service';

export function emotionalEscalationJob(): ScheduledTask {
  return cron.schedule('0 * * * *', async () => {
    try {
      const { data: patients, error } = await supabase.from('patients').select('*');
      if (error) throw error;
      for (const patient of patients ?? []) {
        const { data: messages } = await supabase.from('companion_messages').select('*').eq('patient_id', patient.id).eq('role', 'user').order('created_at', { ascending: false }).limit(2);
        const persistent = (messages ?? []).length === 2 && (messages ?? []).every((message) => message.sentiment === 'sadness' || message.sentiment === 'anxiety');
        if (persistent && !(await alertService.hasRecentEmotionalEscalation(patient.id))) {
          const contacts = await patientRepository.findEscalationContacts(patient.id);
          await smsService.sendEmotionalEscalationSms(patient.full_name, contacts);
          await alertService.createAlert({ patient_id: patient.id, caregiver_id: patient.caregiver_id, alert_type: 'emotional_escalation', message: `${patient.full_name} has persistent sad or anxious messages` });
        }
      }
    } catch (error) {
      logger.error('[JOB] Emotional escalation sweep failed', { error: error instanceof Error ? error.message : String(error) });
    }
  });
}
