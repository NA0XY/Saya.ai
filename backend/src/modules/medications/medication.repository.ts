import { formatISO, startOfDay } from 'date-fns';
import { supabase } from '../../config/supabase';
import type { CallLog, CallRetryJob, MedicationSchedule } from '../../types/database';
import { ApiError } from '../../utils/apiError';

type ScheduleCreate = Omit<MedicationSchedule, 'id' | 'created_at' | 'updated_at'>;
type CallLogCreate = Omit<CallLog, 'id' | 'created_at'>;
type RetryJobCreate = Omit<CallRetryJob, 'id' | 'created_at' | 'updated_at'>;

export const medicationRepository = {
  async createSchedule(data: ScheduleCreate): Promise<MedicationSchedule> {
    const result = await supabase.from('medication_schedules').insert(data).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to create schedule');
    return result.data;
  },
  async findScheduleById(id: string): Promise<MedicationSchedule | null> {
    const { data, error } = await supabase.from('medication_schedules').select('*').eq('id', id).maybeSingle();
    if (error) throw ApiError.internal('Failed to load schedule');
    return data;
  },
  async findActiveSchedules(): Promise<MedicationSchedule[]> {
    const { data, error } = await supabase.from('medication_schedules').select('*').eq('active', true);
    if (error) throw ApiError.internal('Failed to load active schedules');
    return data ?? [];
  },
  async findSchedulesByPatient(patientId: string): Promise<MedicationSchedule[]> {
    const { data, error } = await supabase.from('medication_schedules').select('*').eq('patient_id', patientId).eq('active', true).order('scheduled_time');
    if (error) throw ApiError.internal('Failed to list schedules');
    return data ?? [];
  },
  async deactivateSchedule(id: string): Promise<void> {
    const { error } = await supabase.from('medication_schedules').update({ active: false }).eq('id', id);
    if (error) throw ApiError.internal('Failed to deactivate schedule');
  },
  async createCallLog(data: CallLogCreate): Promise<CallLog> {
    const result = await supabase.from('call_logs').insert(data).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to create call log');
    return result.data;
  },
  async updateCallLog(id: string, updates: Partial<CallLog>): Promise<CallLog> {
    const result = await supabase.from('call_logs').update(updates).eq('id', id).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to update call log');
    return result.data;
  },
  async findCallLogBySid(sid: string): Promise<CallLog | null> {
    const { data, error } = await supabase.from('call_logs').select('*').eq('exotel_call_sid', sid).maybeSingle();
    if (error) throw ApiError.internal('Failed to load call log');
    return data;
  },
  async findCallLogsBySchedule(scheduleId: string): Promise<CallLog[]> {
    const { data, error } = await supabase.from('call_logs').select('*').eq('schedule_id', scheduleId).order('created_at', { ascending: false });
    if (error) throw ApiError.internal('Failed to list call logs');
    return data ?? [];
  },
  async countAttemptsToday(scheduleId: string): Promise<number> {
    const { count, error } = await supabase.from('call_logs').select('*', { count: 'exact', head: true }).eq('schedule_id', scheduleId).gte('created_at', formatISO(startOfDay(new Date()))).in('status', ['no_answer', 'failed']);
    if (error) throw ApiError.internal('Failed to count attempts');
    return count ?? 0;
  },
  async createRetryJob(data: RetryJobCreate): Promise<CallRetryJob> {
    const result = await supabase.from('call_retry_jobs').insert(data).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to create retry job');
    return result.data;
  },
  async findPendingRetryJob(scheduleId: string, attemptNumber: number, occurrenceDate: string): Promise<CallRetryJob | null> {
    const { data, error } = await supabase.from('call_retry_jobs').select('*').eq('schedule_id', scheduleId).eq('attempt_number', attemptNumber).eq('occurrence_date', occurrenceDate).in('status', ['pending', 'processing']).maybeSingle();
    if (error) throw ApiError.internal('Failed to load retry job');
    return data;
  },
  async findRetryJobsBySchedule(scheduleId: string): Promise<CallRetryJob[]> {
    const { data, error } = await supabase.from('call_retry_jobs').select('*').eq('schedule_id', scheduleId).order('created_at', { ascending: false });
    if (error) throw ApiError.internal('Failed to list retry jobs');
    return data ?? [];
  },
  async findDueRetryJobs(nowIso: string): Promise<CallRetryJob[]> {
    const { data, error } = await supabase.from('call_retry_jobs').select('*').eq('status', 'pending').lte('run_at', nowIso).order('run_at').limit(50);
    if (error) throw ApiError.internal('Failed to list due retry jobs');
    return data ?? [];
  },
  async updateRetryJob(id: string, updates: Partial<CallRetryJob>): Promise<CallRetryJob> {
    const result = await supabase.from('call_retry_jobs').update(updates).eq('id', id).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to update retry job');
    return result.data;
  },
  async cancelRetryJobs(scheduleId: string): Promise<void> {
    const { error } = await supabase.from('call_retry_jobs').update({ status: 'cancelled' }).eq('schedule_id', scheduleId).eq('status', 'pending');
    if (error) throw ApiError.internal('Failed to cancel retry jobs');
  },
  async hasFinalAlertBeenSent(scheduleId: string, occurrenceDate: string): Promise<boolean> {
    const { count, error } = await supabase.from('call_retry_jobs').select('*', { count: 'exact', head: true }).eq('schedule_id', scheduleId).eq('occurrence_date', occurrenceDate).eq('final_alert_sent', true);
    if (error) throw ApiError.internal('Failed to check final retry alert');
    return (count ?? 0) > 0;
  }
};
