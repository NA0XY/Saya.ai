"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../modules/auth/auth.controller");
const auth_validator_1 = require("../modules/auth/auth.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', rateLimit_middleware_1.authLimiter, (0, validate_middleware_1.validateBody)(auth_validator_1.RegisterSchema), auth_controller_1.authController.register);
exports.authRouter.post('/login', rateLimit_middleware_1.authLimiter, (0, validate_middleware_1.validateBody)(auth_validator_1.LoginSchema), auth_controller_1.authController.login);
exports.authRouter.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.authController.me);
//# sourceMappingURL=auth.routes.js.map