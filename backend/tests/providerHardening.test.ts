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
    AWS_ACCESS_KEY_ID: 'aws-key',
    AWS_SECRET_ACCESS_KEY: 'aws-secret',
    AWS_REGION: 'ap-south-1',
    EXOTEL_SID: 'exotel-sid',
    EXOTEL_API_KEY: 'exotel-key',
    EXOTEL_API_TOKEN: 'exotel-token',
    EXOTEL_SUBDOMAIN: 'api.exotel.com',
    EXOTEL_CALLER_ID: '+919876543210',
    NEWS_API_KEY: 'news-key',
    JWT_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
    FRONTEND_URL: 'http://localhost:5173',
    BACKEND_URL: 'http://localhost:3001'
  });
}

test('parses Exotel JSON and XML call responses without manufacturing call ids', async () => {
  setRequiredEnv();
  const { parseExotelCallResponse } = await import('../src/modules/calls/exotel.client');

  assert.deepEqual(parseExotelCallResponse({ Call: { Sid: 'json-sid', Status: 'in-progress', Direction: 'outbound-api' } }), {
    sid: 'json-sid',
    status: 'in-progress',
    direction: 'outbound-api'
  });

  assert.deepEqual(parseExotelCallResponse('<TwilioResponse><Call><Sid>xml-sid</Sid><Status>queued</Status><Direction>outbound-api</Direction></Call></TwilioResponse>'), {
    sid: 'xml-sid',
    status: 'queued',
    direction: 'outbound-api'
  });
});

test('rejects malformed Exotel call responses as provider errors', async () => {
  setRequiredEnv();
  const { parseExotelCallResponse } = await import('../src/modules/calls/exotel.client');

  assert.throws(() => parseExotelCallResponse({ Call: { Status: 'queued' } }), {
    name: 'ApiError',
    statusCode: 502,
    code: 'EXOTEL_MALFORMED_RESPONSE'
  });
});

test('emotional escalation requires current and immediately previous user sentiments to be negative', async () => {
  setRequiredEnv();
  const { shouldEscalateForConsecutiveNegativeSentiments } = await import('../src/modules/companion/sentiment.service');

  assert.equal(shouldEscalateForConsecutiveNegativeSentiments('sadness', 'anxiety'), true);
  assert.equal(shouldEscalateForConsecutiveNegativeSentiments('anxiety', 'sadness'), true);
  assert.equal(shouldEscalateForConsecutiveNegativeSentiments('sadness', 'neutral'), false);
  assert.equal(shouldEscalateForConsecutiveNegativeSentiments('sadness', null), false);
});
