import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { env } from './env';

const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  const context = Object.keys(meta).length ? ` -- ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${context}`;
});

const transports: winston.transport[] = [];

if (env.NODE_ENV === 'production') {
  const logDir = path.resolve(process.cwd(), 'logs');
  fs.mkdirSync(logDir, { recursive: true });
  transports.push(new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }));
  transports.push(new winston.transports.File({ filename: path.join(logDir, 'combined.log') }));
} else {
  transports.push(new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), logFormat)
  }));
}

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), logFormat),
  transports
});
