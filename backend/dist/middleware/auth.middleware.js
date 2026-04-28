"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalDemoAuth = optionalDemoAuth;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const env_1 = require("../config/env");
const apiError_1 = require("../utils/apiError");
function authMiddleware(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        next(apiError_1.ApiError.unauthorized('Missing bearer token'));
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(header.slice(7), env_1.env.JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            next(apiError_1.ApiError.unauthorized('Token expired'));
            return;
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            next(apiError_1.ApiError.unauthorized('Invalid token'));
            return;
        }
        next(apiError_1.ApiError.unauthorized());
    }
}
function optionalDemoAuth(req, res, next) {
    if (req.query.demo === 'true' || req.params.patientId === 'demo-patient-uuid' || req.params.id === 'demo-patient-uuid') {
        next();
        return;
    }
    authMiddleware(req, res, next);
}
//# sourceMappingURL=auth.middleware.js.map