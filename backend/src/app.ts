/// <reference path="./types/express.d.ts" />
import './config/env';
import path from 'path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './config/cors';
import { logger } from './config/logger';
import { errorMiddleware } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimit.middleware';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { frontendContractRouter } from './routes/frontendContract.routes';
import { router } from './routes';
import { webhookRouter } from './routes/webhook.routes';
import { supabase } from './config/supabase';
import { ApiError } from './utils/apiError';

export const app = express();
app.use(requestIdMiddleware);
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(generalLimiter);
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/ready', async (_req, res) => {
  const startedAt = Date.now();
  const { error } = await supabase.from('users').select('id', { count: 'exact', head: true }).limit(1);
  res.status(error ? 503 : 200).json({
    status: error ? 'degraded' : 'ready',
    checks: {
      env: true,
      supabase: !error
    },
    supabase_error: error
      ? {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      }
      : null,
    latency_ms: Date.now() - startedAt
  });
});
app.use('/v1', frontendContractRouter);
app.use('/api/v1', frontendContractRouter);
app.use('/api', router);
app.use('/webhooks', webhookRouter);
app.use((_req, _res, next) => next(ApiError.notFound('Route')));
app.use(errorMiddleware);
