"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalLimiter = exports.companionLimiter = exports.uploadLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const standardHeaders = true;
const legacyHeaders = false;
exports.authLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders, legacyHeaders });
exports.uploadLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders, legacyHeaders });
exports.companionLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 1000, limit: 60, standardHeaders, legacyHeaders });
exports.generalLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders, legacyHeaders });
//# sourceMappingURL=rateLimit.middleware.js.map