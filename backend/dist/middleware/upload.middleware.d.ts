import type { NextFunction, Request, Response } from 'express';
declare global {
    namespace Express {
        namespace Multer {
            interface File {
                publicPath?: string;
            }
        }
    }
}
export interface UploadedFile extends Express.Multer.File {
    publicPath: string;
}
export declare function handlePrescriptionUpload(req: Request, res: Response, next: NextFunction): void;
export declare function handleMedicineImageUpload(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=upload.middleware.d.ts.map