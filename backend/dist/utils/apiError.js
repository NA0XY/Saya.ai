"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message, details, code = 'API_ERROR') {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, details) {
        return new ApiError(400, message, details, 'BAD_REQUEST');
    }
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message, undefined, 'UNAUTHORIZED');
    }
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message, undefined, 'FORBIDDEN');
    }
    static notFound(resource = 'Resource') {
        return new ApiError(404, `${resource} not found`, undefined, 'NOT_FOUND');
    }
    static conflict(message) {
        return new ApiError(409, message, undefined, 'CONFLICT');
    }
    static internal(message = 'Internal server error') {
        return new ApiError(500, message, undefined, 'INTERNAL_ERROR');
    }
    static badGateway(message = 'External provider error', details, code = 'BAD_GATEWAY') {
        return new ApiError(502, message, details, code);
    }
    static serviceUnavailable(message = 'Service unavailable', details, code = 'SERVICE_UNAVAILABLE') {
        return new ApiError(503, message, details, code);
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=apiError.js.map