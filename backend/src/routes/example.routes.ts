import { Router } from 'express';

export const exampleRouter = Router();

exampleRouter.get('/ping', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
});