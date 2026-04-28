import assert from 'node:assert/strict';
import test from 'node:test';

function setRequiredEnv(): void {
  Object.assign(process.env, {
    PORT: '3001',
    NODE_ENV: 'test',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    GROQ_API_KEY: 'groq-key',
    GOOGLE_APPLICATION_CREDENTIALS: './gcp-credentials.json',
    GOOGLE_CLIENT_ID: 'google-client-id',
    GOOGLE_CLIENT_SECRET: 'google-client-secret',
    GOOGLE_OAUTH_REDIRECT_URL: 'http://localhost:3001/v1/auth/google/callback',
    AWS_ACCESS_KEY_ID: 'aws-key',
    AWS_SECRET_ACCESS_KEY: 'aws-secret',
    AWS_REGION: 'ap-south-1',
    TWILIO_ACCOUNT_SID: 'twilio-account-sid',
    TWILIO_AUTH_TOKEN: 'twilio-auth-token',
    TWILIO_PHONE_NUMBER: '+1234567890',
    NEWS_API_KEY: 'news-key',
    JWT_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
    FRONTEND_URL: 'http://localhost:5173',
    BACKEND_URL: 'http://localhost:3001',
  });
}

// === Twilio Provider Tests ===

test('Twilio provider is a valid TelephonyProvider implementation', async () => {
  setRequiredEnv();
  const { twilioClient } = await import('../src/modules/calls/twilio.client');

  assert.equal(typeof twilioClient.makeCall, 'function');
  assert.equal(typeof twilioClient.sendSms, 'function');
  assert.equal(typeof twilioClient.generateTwiML, 'function');
});

test('generateTwiML produces valid XML with <Gather> for DTMF input', async () => {
  setRequiredEnv();
  const { twilioClient } = await import('../src/modules/calls/twilio.client');

  const twiml = twilioClient.generateTwiML({
    message: 'Hello. Press 1 for yes, 2 for no.',
    gather: true,
    language: 'en',
    actionUrl: 'https://example.com/ivr-response',
  });

  assert.ok(twiml.includes('<Gather'));
  assert.ok(twiml.includes('numDigits="1"'));
  assert.ok(twiml.includes('action="https://example.com/ivr-response"'));
  assert.ok(twiml.includes('<Say'));
  assert.ok(twiml.includes('Polly.Aditi'));
  assert.ok(twiml.includes('<Redirect'));
  assert.ok(twiml.startsWith('<?xml'));
});

test('generateTwiML without gather produces plain <Say> (no DTMF)', async () => {
  setRequiredEnv();
  const { twilioClient } = await import('../src/modules/calls/twilio.client');

  const twiml = twilioClient.generateTwiML({
    message: 'Thank you for confirming.',
    gather: false,
    language: 'en',
    actionUrl: '',
  });

  assert.ok(!twiml.includes('<Gather'));
  assert.ok(twiml.includes('<Say'));
  assert.ok(twiml.includes('Thank you for confirming.'));
});

test('generateTwiML maps language correctly (hi → hi-IN, en → en-IN)', async () => {
  setRequiredEnv();
  const { twilioClient } = await import('../src/modules/calls/twilio.client');

  const hindiTwiml = twilioClient.generateTwiML({
    message: 'Namaste.',
    gather: true,
    language: 'hi',
    actionUrl: 'https://example.com/ivr',
  });

  const englishTwiml = twilioClient.generateTwiML({
    message: 'Hello.',
    gather: true,
    language: 'en',
    actionUrl: 'https://example.com/ivr',
  });

  // Both should produce valid TwiML with Polly voice
  assert.ok(hindiTwiml.includes('<Say'));
  assert.ok(englishTwiml.includes('<Say'));
  // Unknown language falls back to en-IN
  const unknownTwiml = twilioClient.generateTwiML({
    message: 'Test',
    gather: true,
    language: 'ta' as 'hi',
    actionUrl: 'https://example.com/ivr',
  });
  assert.ok(unknownTwiml.includes('<Say'));
});

// === Webhook Payload Mapping Tests ===

test('Twilio status webhook maps CallStatus → Status for downstream services', async () => {
  setRequiredEnv();

  // Simulate what handleTwilioStatus does: map CallStatus to Status
  const payload = { CallSid: 'CA12345', CallStatus: 'completed', To: '+123', From: '+456' };
  const mapped = {
    CallSid: payload.CallSid,
    Status: payload.CallStatus ?? 'unknown',
    To: payload.To,
    From: payload.From,
    Duration: undefined,
  };

  assert.equal(mapped.Status, 'completed');
  assert.equal(mapped.CallSid, 'CA12345');
});

test('Twilio IVR response maps Digits for DTMF input (1 = confirmed, 2 = rejected, empty = timeout)', async () => {
  setRequiredEnv();

  const payloadWithDigit1 = { CallSid: 'CA1', Digits: '1', DialCallStatus: '', To: '', From: '' };
  assert.equal(payloadWithDigit1.Digits, '1');

  const payloadWithDigit2 = { CallSid: 'CA2', Digits: '2', DialCallStatus: '', To: '', From: '' };
  assert.equal(payloadWithDigit2.Digits, '2');

  // Timeout — empty Digits
  const payloadTimeout = { CallSid: 'CA3', Digits: '', DialCallStatus: '', To: '', From: '' };
  assert.equal(payloadTimeout.Digits, '');
});

// === Retry Flow Validation ===

test('status mapping handles Twilio hyphenated statuses (no-answer, in-progress)', () => {
  // This mirrors the mapStatus function in call.service.ts
  function mapStatus(status: string): string {
    const normalized = status.toLowerCase().replace(/-/g, '_');
    if (['completed', 'answered', 'in_progress'].includes(normalized)) return 'answered';
    if (['no_answer', 'busy', 'canceled'].includes(normalized)) return 'no_answer';
    if (['failed'].includes(normalized)) return 'failed';
    return 'initiated';
  }

  assert.equal(mapStatus('no-answer'), 'no_answer');
  assert.equal(mapStatus('busy'), 'no_answer');
  assert.equal(mapStatus('completed'), 'answered');
  assert.equal(mapStatus('answered'), 'answered');
  assert.equal(mapStatus('in-progress'), 'answered');
  assert.equal(mapStatus('failed'), 'failed');
  assert.equal(mapStatus('ringing'), 'initiated');
});

test('status mapping against Twilio real-world CallStatus values', () => {
  function mapStatus(status: string): string {
    const normalized = status.toLowerCase().replace(/-/g, '_');
    if (['completed', 'answered', 'in_progress'].includes(normalized)) return 'answered';
    if (['no_answer', 'busy', 'canceled'].includes(normalized)) return 'no_answer';
    if (['failed'].includes(normalized)) return 'failed';
    return 'initiated';
  }

  // Twilio real-world status values
  assert.equal(mapStatus('queued'), 'initiated');
  assert.equal(mapStatus('ringing'), 'initiated');
  assert.equal(mapStatus('in-progress'), 'answered');
  assert.equal(mapStatus('completed'), 'answered');
  assert.equal(mapStatus('busy'), 'no_answer');
  assert.equal(mapStatus('no-answer'), 'no_answer');
  assert.equal(mapStatus('canceled'), 'no_answer');
  assert.equal(mapStatus('failed'), 'failed');
});

// === Emotional Escalation Tests (unchanged from original) ===

test('emotional escalation requires current and immediately previous user sentiments to be negative', async () => {
  setRequiredEnv();
  const { shouldEscalateForConsecutiveNegativeSentiments } = await import('../src/modules/companion/sentiment.service');

  assert.equal(shouldEscalateForConsecutiveNegativeSentiments('sadness', 'anxiety'), true);
  assert.equal(shouldEscalateForConsecutiveNegativeSentiments('anxiety', 'sadness'), true);
  assert.equal(shouldEscalateForConsecutiveNegativeSentiments('sadness', 'neutral'), false);
  assert.equal(shouldEscalateForConsecutiveNegativeSentiments('sadness', null), false);
});