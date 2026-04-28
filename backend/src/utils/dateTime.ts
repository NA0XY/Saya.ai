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
