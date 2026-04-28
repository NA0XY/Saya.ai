import rateLimit from 'express-rate-limit';

const standardHeaders = true;
const legacyHeaders = false;

export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders, legacyHeaders });
export const uploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders, legacyHeaders });
export const companionLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders, legacyHeaders });
export const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders, legacyHeaders });
