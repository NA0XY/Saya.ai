export declare class ApiError extends Error {
    statusCode: number;
    code: string;
    details?: unknown;
    constructor(statusCode: number, message: string, details?: unknown, code?: string);
    static badRequest(message: string, details?: unknown): ApiError;
    static unauthorized(message?: string): ApiError;
    static forbidden(message?: string): ApiError;
    static notFound(resource?: string): ApiError;
    static conflict(message: string): ApiError;
    static internal(message?: string): ApiError;
    static badGateway(message?: string, details?: unknown, code?: string): ApiError;
    static serviceUnavailable(message?: string, details?: unknown, code?: string): ApiError;
}
//# sourceMappingURL=apiError.d.ts.map