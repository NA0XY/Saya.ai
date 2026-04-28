import { ApiError } from './apiError';

export function toE164India(phone: string): string {
  const stripped = phone.replace(/[\s\-()]/g, '');
  let normalized = stripped;
  if (/^\d{10}$/.test(normalized)) normalized = `+91${normalized}`;
  if (/^0\d{10}$/.test(normalized)) normalized = `+91${normalized.slice(1)}`;
  if (/^91\d{10}$/.test(normalized)) normalized = `+${normalized}`;
  if (!isValidIndianPhone(normalized)) throw ApiError.badRequest('Invalid Indian mobile number');
  return normalized;
}

export function isValidIndianPhone(phone: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(phone);
}

export function maskPhone(phone: string): string {
  const normalized = phone.replace(/[\s\-()]/g, '');
  if (normalized.length <= 8) return normalized;
  return `${normalized.slice(0, 5)}XXXX...${normalized.slice(-4)}`;
}
