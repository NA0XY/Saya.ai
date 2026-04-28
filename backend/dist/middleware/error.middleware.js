"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const apiError_1 = require("../utils/apiError");
function errorMiddleware(err, req, res, _next) {
    if (err instanceof apiError_1.ApiError) {
        res.status(err.statusCode).json({ success: false, code: err.code, message: err.message, requestId: req.requestId, details: err.details });
        return;
    }
    if (err instanceof multer_1.default.MulterError) {
        res.status(400).json({ success: false, code: 'UPLOAD_ERROR', message: err.message, requestId: req.requestId });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        res.status(422).json({ success: false, code: 'VALIDATION_ERROR', message: 'Validation error', requestId: req.requestId, details: err.format() });
        return;
    }
    logger_1.logger.error('[ERROR] Unhandled request error', { message: err.message, stack: err.stack });
    res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        requestId: req.requestId,
        ...(env_1.env.NODE_ENV === 'production' ? {} : { stack: err.stack })
    });
}
//# sourceMappingURL=error.middleware.js.map