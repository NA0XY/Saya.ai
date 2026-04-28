# Twilio Migration — Complete

## Overview

Successfully migrated Saya.ai backend from **Exotel** to **Twilio** for telephony (voice calls + SMS).

**Migration Date:** April 28, 2026  
**Status:** ✅ Complete  
**Breaking Changes:** Environment variables only (see below)

---

## What Changed

### 1. **Provider Abstraction**
- Created `telephony.types.ts` — clean interface for future provider swaps
- Implemented `twilio.client.ts` — Twilio SDK wrapper matching the interface

### 2. **Core Services Refactored**
- `call.service.ts` — now uses Twilio provider, removed TTS dependency (Twilio `<Say>` handles TTS natively)
- `sms.service.ts` — migrated to Twilio Messages API
- `retry.service.ts` — **unchanged** (business logic preserved)

### 3. **Webhooks**
- **New:** `twilio.webhook.ts` — unified handler for IVR + status callbacks
- **Routes:**
  - `GET/POST /webhooks/twilio/ivr` — TwiML generation endpoint
  - `POST /webhooks/twilio/ivr-response` — DTMF input handler
  - `POST /webhooks/twilio/status` — call lifecycle events
- **Legacy routes preserved** for backward compatibility during transition

### 4. **Database**
- Column `call_logs.exotel_call_sid` **retained** — now stores Twilio SIDs (no migration needed)

### 5. **TTS (Text-to-Speech)**
- **Before:** AWS Polly → MP3 file → Exotel audio URL
- **After:** Twilio `<Say>` with Polly.Aditi voice (hi-IN/en-IN)
- **Result:** Simpler, no file storage, same voice quality

---

## Environment Variables

### ❌ Removed (Exotel)
```bash
EXOTEL_SID
EXOTEL_API_KEY
EXOTEL_API_TOKEN
EXOTEL_SUBDOMAIN
EXOTEL_CALLER_ID
EXOTEL_TIMEOUT_MS
```

### ✅ Added (Twilio)
```bash
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_TIMEOUT_MS=10000
```

**Action Required:** Update `.env` file with Twilio credentials before deployment.

---

## Behavioral Equivalence

| Feature | Exotel | Twilio | Status |
|---------|--------|--------|--------|
| Outbound calls | ✅ | ✅ | **Preserved** |
| IVR (DTMF input) | ✅ | ✅ | **Preserved** |
| Call status webhooks | ✅ | ✅ | **Preserved** |
| SMS notifications | ✅ | ✅ | **Preserved** |
| Retry logic (5 attempts) | ✅ | ✅ | **Preserved** |
| Hindi + English TTS | ✅ (Polly) | ✅ (Polly via Twilio) | **Preserved** |
| Idempotency | ⚠️ Basic | ✅ Enhanced | **Improved** |

---

## Key Implementation Details

### 1. **TwiML Flow**
When a call is initiated:
1. Twilio requests TwiML from `GET /webhooks/twilio/ivr?scheduleId=...&language=...`
2. Backend generates TwiML with `<Gather>` for DTMF input + `<Say>` for voice prompt
3. User presses 1 (confirmed) or 2 (rejected), or times out (5 seconds)
4. Twilio POSTs result to `/webhooks/twilio/ivr-response`
5. Backend updates call log, cancels retries if confirmed, sends SMS to caregivers

### 2. **Status Mapping**
Twilio sends hyphenated statuses (`no-answer`, `in-progress`). The `mapStatus()` function normalizes:
- `no-answer`, `busy`, `canceled` → `no_answer` (triggers retry)
- `completed`, `answered`, `in-progress` → `answered`
- `failed` → `failed` (triggers retry)
- Others → `initiated`

### 3. **Idempotency**
Added duplicate webhook protection in `call.service.ts`:
- Skip if `CallSid` is unknown (log warning)
- Skip if status hasn't changed (prevents duplicate retries)

### 4. **Language Support**
- `hi` → `hi-IN` (Hindi, Polly.Aditi voice)
- `en` → `en-IN` (English, Polly.Aditi voice)
- Fallback: `en-IN`

---

## Testing

Updated `tests/providerHardening.test.ts`:
- ✅ TwiML generation (with/without `<Gather>`)
- ✅ Language mapping (hi-IN, en-IN)
- ✅ Status mapping (Twilio → internal statuses)
- ✅ DTMF input handling (1, 2, timeout)
- ✅ Webhook payload mapping

**Run tests:**
```bash
npm test
```

---

## Files Modified

| File | Change |
|------|--------|
| `modules/calls/telephony.types.ts` | **NEW** — Provider interface |
| `modules/calls/twilio.client.ts` | **NEW** — Twilio implementation |
| `modules/calls/call.service.ts` | Refactored (Twilio provider, removed TTS) |
| `modules/calls/sms.service.ts` | Refactored (Twilio SMS) |
| `modules/calls/call.types.ts` | Updated (re-export telephony types) |
| `webhooks/twilio.webhook.ts` | **NEW** — Unified webhook handler |
| `routes/webhook.routes.ts` | Added Twilio routes |
| `config/env.ts` | Replaced Exotel vars with Twilio |
| `.env.example` | Updated |
| `tests/providerHardening.test.ts` | Rewritten for Twilio |
| `modules/calls/exotel.client.ts` | **REMOVED** |

---

## Deployment Checklist

- [ ] Update `.env` with Twilio credentials
- [ ] Configure Twilio webhook URLs in Twilio Console:
  - Voice URL: `https://your-backend.com/webhooks/twilio/ivr`
  - Status Callback: `https://your-backend.com/webhooks/twilio/status`
- [ ] Test a single call in staging environment
- [ ] Verify SMS delivery to caregivers
- [ ] Monitor retry logic (check `call_retry_jobs` table)
- [ ] Remove legacy Exotel webhook routes after 1 week (optional)

---

## Rollback Plan

If issues arise:
1. Revert to previous commit (before migration)
2. Restore Exotel env vars
3. Redeploy

**Note:** Database schema unchanged — rollback is safe.

---

## Future Improvements

1. **Provider switching:** Use dependency injection to swap providers at runtime
2. **Multi-provider:** Support both Exotel + Twilio simultaneously (A/B testing)
3. **Voice recording:** Add call recording via Twilio Recording API
4. **Analytics:** Track call duration, DTMF response times

---

## Support

For issues or questions:
- Check logs: `[TWILIO]` prefix for Twilio-specific logs
- Twilio Console: https://console.twilio.com
- Twilio Docs: https://www.twilio.com/docs/voice

---

**Migration completed successfully. All business logic preserved. System ready for production.**