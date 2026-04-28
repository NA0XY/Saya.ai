import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError';

function validate<T>(schema: ZodSchema<T>, source: 'body' | 'query' | 'params'): RequestHandler {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      Object.defineProperty(req, source, { value: parsed, writable: true, configurable: true });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ApiError(422, 'Validation error', error.errors, 'VALIDATION_ERROR'));
        return;
      }
      next(error);
    }
  };
}

export const validateBody = <T>(schema: ZodSchema<T>): RequestHandler => validate(schema, 'body');
export const validateQuery = <T>(schema: ZodSchema<T>): RequestHandler => validate(schema, 'query');
export const validateParams = <T>(schema: ZodSchema<T>): RequestHandler => validate(schema, 'params');
