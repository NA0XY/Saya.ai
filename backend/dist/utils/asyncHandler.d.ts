import type { NextFunction, Request, RequestHandler, Response } from 'express';
export declare const asyncHandler: <T extends Request = Request>(fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>) => RequestHandler;
//# sourceMappingURL=asyncHandler.d.ts.map