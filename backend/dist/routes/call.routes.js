"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const call_controller_1 = require("../modules/calls/call.controller");
const ScheduleQuerySchema = zod_1.z.object({ scheduleId: zod_1.z.string().uuid() });
const TriggerCallSchema = zod_1.z.object({ scheduleId: zod_1.z.string().uuid() });
exports.callRouter = (0, express_1.Router)();
exports.callRouter.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateQuery)(ScheduleQuerySchema), call_controller_1.callController.getCallLogs);
exports.callRouter.post('/trigger', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateBody)(TriggerCallSchema), call_controller_1.callController.triggerCall);
//# sourceMappingURL=call.routes.js.map