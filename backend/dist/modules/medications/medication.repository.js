"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicationRepository = void 0;
const date_fns_1 = require("date-fns");
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
exports.medicationRepository = {
    async createSchedule(data) {
        const result = await supabase_1.supabase.from('medication_schedules').insert(data).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to create schedule');
        return result.data;
    },
    async findScheduleById(id) {
        const { data, error } = await supabase_1.supabase.from('medication_schedules').select('*').eq('id', id).maybeSingle();
        if (error)
            throw apiError_1.ApiError.internal('Failed to load schedule');
        return data;
    },
    async findActiveSchedules() {
        const { data, error } = await supabase_1.supabase.from('medication_schedules').select('*').eq('active', true);
        if (error)
            throw apiError_1.ApiError.internal('Failed to load active schedules');
        return data ?? [];
    },
    async findSchedulesByPatient(patientId) {
        const { data, error } = await supabase_1.supabase.from('medication_schedules').select('*').eq('patient_id', patientId).eq('active', true).order('scheduled_time');
        if (error)
            throw apiError_1.ApiError.internal('Failed to list schedules');
        return data ?? [];
    },
    async deactivateSchedule(id) {
        const { error } = await supabase_1.supabase.from('medication_schedules').update({ active: false }).eq('id', id);
        if (error)
            throw apiError_1.ApiError.internal('Failed to deactivate schedule');
    },
    async createCallLog(data) {
        const result = await supabase_1.supabase.from('call_logs').insert(data).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to create call log');
        return result.data;
    },
    async updateCallLog(id, updates) {
        const result = await supabase_1.supabase.from('call_logs').update(updates).eq('id', id).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to update call log');
        return result.data;
    },
    async findCallLogBySid(sid) {
        const { data, error } = await supabase_1.supabase.from('call_logs').select('*').eq('exotel_call_sid', sid).maybeSingle();
        if (error)
            throw apiError_1.ApiError.internal('Failed to load call log');
        return data;
    },
    async findCallLogsBySchedule(scheduleId) {
        const { data, error } = await supabase_1.supabase.from('call_logs').select('*').eq('schedule_id', scheduleId).order('created_at', { ascending: false });
        if (error)
            throw apiError_1.ApiError.internal('Failed to list call logs');
        return data ?? [];
    },
    async countAttemptsToday(scheduleId) {
        const { count, error } = await supabase_1.supabase.from('call_logs').select('*', { count: 'exact', head: true }).eq('schedule_id', scheduleId).gte('created_at', (0, date_fns_1.formatISO)((0, date_fns_1.startOfDay)(new Date()))).in('status', ['no_answer', 'failed']);
        if (error)
            throw apiError_1.ApiError.internal('Failed to count attempts');
        return count ?? 0;
    },
    async createRetryJob(data) {
        const result = await supabase_1.supabase.from('call_retry_jobs').insert(data).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to create retry job');
        return result.data;
    },
    async findPendingRetryJob(scheduleId, attemptNumber, occurrenceDate) {
        const { data, error } = await supabase_1.supabase.from('call_retry_jobs').select('*').eq('schedule_id', scheduleId).eq('attempt_number', attemptNumber).eq('occurrence_date', occurrenceDate).in('status', ['pending', 'processing']).maybeSingle();
        if (error)
            throw apiError_1.ApiError.internal('Failed to load retry job');
        return data;
    },
    async findRetryJobsBySchedule(scheduleId) {
        const { data, error } = await supabase_1.supabase.from('call_retry_jobs').select('*').eq('schedule_id', scheduleId).order('created_at', { ascending: false });
        if (error)
            throw apiError_1.ApiError.internal('Failed to list retry jobs');
        return data ?? [];
    },
    async findDueRetryJobs(nowIso) {
        const { data, error } = await supabase_1.supabase.from('call_retry_jobs').select('*').eq('status', 'pending').lte('run_at', nowIso).order('run_at').limit(50);
        if (error)
            throw apiError_1.ApiError.internal('Failed to list due retry jobs');
        return data ?? [];
    },
    async updateRetryJob(id, updates) {
        const result = await supabase_1.supabase.from('call_retry_jobs').update(updates).eq('id', id).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to update retry job');
        return result.data;
    },
    async cancelRetryJobs(scheduleId) {
        const { error } = await supabase_1.supabase.from('call_retry_jobs').update({ status: 'cancelled' }).eq('schedule_id', scheduleId).eq('status', 'pending');
        if (error)
            throw apiError_1.ApiError.internal('Failed to cancel retry jobs');
    },
    async hasFinalAlertBeenSent(scheduleId, occurrenceDate) {
        const { count, error } = await supabase_1.supabase.from('call_retry_jobs').select('*', { count: 'exact', head: true }).eq('schedule_id', scheduleId).eq('occurrence_date', occurrenceDate).eq('final_alert_sent', true);
        if (error)
            throw apiError_1.ApiError.internal('Failed to check final retry alert');
        return (count ?? 0) > 0;
    }
};
//# sourceMappingURL=medication.repository.js.map