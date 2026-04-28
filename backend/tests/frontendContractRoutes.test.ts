import assert from 'node:assert/strict';
import http from 'node:http';
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
    JWT_EXPIRES_IN: '7d',
    FRONTEND_URL: 'http://localhost:5173',
    BACKEND_URL: 'http://localhost:3001',
    MAX_FILE_SIZE_MB: '10',
    UPLOAD_DIR: './uploads',
    MAX_CALL_RETRIES: '5',
    RETRY_INTERVAL_MINUTES: '3'
  });
}

async function listen() {
  setRequiredEnv();
  const { app } = await import('../src/app');
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Failed to bind test server');
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  };
}

test('frontend contract mounts user profile at /v1 and /api/v1 with a flat camelCase body', async () => {
  setRequiredEnv();
  const { frontendContractService } = await import('../src/modules/frontendContract/frontendContract.service');
  frontendContractService.getProfile = async () => ({
    id: 'user-1',
    name: 'Harsh',
    email: 'harsh@example.com',
    onboardingComplete: true,
    role: 'caregiver'
  });
  const { sign } = await import('jsonwebtoken');
  const token = sign({ id: 'user-1', email: 'harsh@example.com', role: 'caregiver' }, process.env.JWT_SECRET!);
  const server = await listen();

  try {
    for (const prefix of ['/v1', '/api/v1']) {
      const response = await fetch(`${server.baseUrl}${prefix}/user/profile`, { headers: { Authorization: `Bearer ${token}` } });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        id: 'user-1',
        name: 'Harsh',
        email: 'harsh@example.com',
        onboardingComplete: true,
        role: 'caregiver'
      });
    }
  } finally {
    await server.close();
  }
});

test('frontend contract accepts camelCase medication schedule input and returns the OpenAPI DTO', async () => {
  setRequiredEnv();
  const { frontendContractService } = await import('../src/modules/frontendContract/frontendContract.service');
  frontendContractService.scheduleMedication = async (_input, _caregiverId) => ({ id: 'schedule-1', status: 'scheduled' });
  const { sign } = await import('jsonwebtoken');
  const token = sign({ id: 'user-1', email: 'harsh@example.com', role: 'caregiver' }, process.env.JWT_SECRET!);
  const server = await listen();

  try {
    const response = await fetch(`${server.baseUrl}/v1/medications/schedule`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ drugName: 'Aspirin', time: '08:00', customMessage: 'Take after breakfast' })
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { id: 'schedule-1', status: 'scheduled' });
  } finally {
    await server.close();
  }
});

test('frontend contract maps companion chat to response, mood, and actions', async () => {
  setRequiredEnv();
  const { frontendContractService } = await import('../src/modules/frontendContract/frontendContract.service');
  frontendContractService.chat = async () => ({
    response: 'I am here with you.',
    mood: 'happy',
    actions: [{ type: 'reminder', data: { when: 'evening' } }]
  });
  const { sign } = await import('jsonwebtoken');
  const token = sign({ id: 'user-1', email: 'harsh@example.com', role: 'caregiver' }, process.env.JWT_SECRET!);
  const server = await listen();

  try {
    const response = await fetch(`${server.baseUrl}/v1/companion/chat`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I feel better today', context: { lastMood: 'neutral', location: 'home' } })
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      response: 'I am here with you.',
      mood: 'happy',
      actions: [{ type: 'reminder', data: { when: 'evening' } }]
    });
  } finally {
    await server.close();
  }
});
