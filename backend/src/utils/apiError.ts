export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, details, 'BAD_REQUEST');
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message, undefined, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message, undefined, 'FORBIDDEN');
  }

  static notFound(resource = 'Resource'): ApiError {
    return new ApiError(404, `${resource} not found`, undefined, 'NOT_FOUND');
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message, undefined, 'CONFLICT');
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, undefined, 'INTERNAL_ERROR');
  }

  static badGateway(message = 'External provider error', details?: unknown, code = 'BAD_GATEWAY'): ApiError {
    return new ApiError(502, message, details, code);
  }

  static serviceUnavailable(message = 'Service unavailable', details?: unknown, code = 'SERVICE_UNAVAILABLE'): ApiError {
    return new ApiError(503, message, details, code);
  }
}
