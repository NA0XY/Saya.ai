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
    JWT_EXPIRES_IN: '7d',
    FRONTEND_URL: 'http://localhost:5173',
    BACKEND_URL: 'http://localhost:3001',
    MAX_FILE_SIZE_MB: '10',
    UPLOAD_DIR: './uploads',
    MAX_CALL_RETRIES: '5',
    RETRY_INTERVAL_MINUTES: '3'
  });
}

test('maps openFDA label interaction text to traceable safety records', async () => {
  setRequiredEnv();
  const { mapOpenFdaLabelToInteractions } = await import('../src/modules/safety/openfda.client');

  const records = mapOpenFdaLabelToInteractions('Aspirin', {
    openfda: { brand_name: ['Ecosprin'], generic_name: ['Aspirin'] },
    drug_interactions: ['Alcohol may increase bleeding risk when used with aspirin.'],
    warnings: ['Serious bleeding can occur.']
  });

  assert.equal(records.length, 1);
  assert.equal(records[0].drug_name, 'Aspirin');
  assert.equal(records[0].interaction_type, 'drug');
  assert.equal(records[0].interacting_substance, 'OpenFDA labeled interaction');
  assert.equal(records[0].severity, 'moderate');
  assert.equal(records[0].source, 'openfda');
  assert.deepEqual(records[0].drug_aliases, ['Ecosprin', 'Aspirin']);
});

test('extracts RxNorm normalized names and aliases from related concept groups', async () => {
  setRequiredEnv();
  const { extractRxNormNames } = await import('../src/modules/safety/rxnorm.client');

  const names = extractRxNormNames({
    allRelatedGroup: {
      conceptGroup: [
        { tty: 'SCD', conceptProperties: [{ name: 'metformin 500 MG Oral Tablet' }] },
        { tty: 'BN', conceptProperties: [{ name: 'Glucophage' }, { name: 'Glycomet' }] }
      ]
    }
  });

  assert.deepEqual(names, ['metformin 500 MG Oral Tablet', 'Glucophage', 'Glycomet']);
});
