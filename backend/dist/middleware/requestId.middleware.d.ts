import type { NextFunction, Request, Response } from 'express';
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
        }
    }
}
export declare function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=requestId.middleware.d.ts.map