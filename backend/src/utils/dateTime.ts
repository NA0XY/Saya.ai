import { addDays, format } from 'date-fns';

const IST_OFFSET_MINUTES = 330;

export function toIST(date: Date | string): Date {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return new Date(parsed.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
}

export function formatIST(date: Date | string, formatStr: string): string {
  return format(toIST(date), formatStr);
}

export function parseScheduleTime(timeStr: string): { hours: number; minutes: number } {
  const match = /^(\d{2}):(\d{2})$/.exec(timeStr);
  if (!match) throw new Error('Schedule time must be in HH:MM format');
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new Error('Schedule time must be a valid HH:MM time');
  return { hours, minutes };
}

function padTimePart(value: number): string {
  return value.toString().padStart(2, '0');
}

export function shiftTimeByMinutes(timeStr: string, deltaMinutes: number): string {
  const { hours, minutes } = parseScheduleTime(timeStr);
  const totalMinutes = hours * 60 + minutes + deltaMinutes;
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const nextHours = Math.floor(normalized / 60);
  const nextMinutes = normalized % 60;
  return `${padTimePart(nextHours)}:${padTimePart(nextMinutes)}`;
}

export function convertLocalTimeToIst(timeStr: string, timezoneOffsetMinutes?: number): string {
  const localOffsetMinutes = typeof timezoneOffsetMinutes === 'number'
    ? -timezoneOffsetMinutes
    : -new Date().getTimezoneOffset();
  const deltaMinutes = IST_OFFSET_MINUTES - localOffsetMinutes;
  return shiftTimeByMinutes(timeStr, deltaMinutes);
}

export function getNextOccurrence(timeStr: string): Date {
  const { hours, minutes } = parseScheduleTime(timeStr);
  const nowUtc = new Date();
  const nowIst = toIST(nowUtc);
  const nextIst = new Date(nowIst);
  nextIst.setHours(hours, minutes, 0, 0);
  const finalIst = nextIst.getTime() <= nowIst.getTime() ? addDays(nextIst, 1) : nextIst;
  return new Date(finalIst.getTime() - IST_OFFSET_MINUTES * 60 * 1000);
}

export function isoNow(): string {
  return new Date().toISOString();
}
