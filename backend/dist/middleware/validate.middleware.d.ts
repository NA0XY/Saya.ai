import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
export declare const validateBody: <T>(schema: ZodSchema<T>) => RequestHandler;
export declare const validateQuery: <T>(schema: ZodSchema<T>) => RequestHandler;
export declare const validateParams: <T>(schema: ZodSchema<T>) => RequestHandler;
//# sourceMappingURL=validate.middleware.d.ts.map