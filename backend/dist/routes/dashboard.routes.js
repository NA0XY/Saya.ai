"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const dashboard_controller_1 = require("../modules/dashboard/dashboard.controller");
const PatientParamsSchema = zod_1.z.object({ id: zod_1.z.union([zod_1.z.string().uuid(), zod_1.z.literal('demo-patient-uuid')]) });
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.get('/', auth_middleware_1.optionalDemoAuth, dashboard_controller_1.dashboardController.getSummary);
exports.dashboardRouter.get('/patient/:id', auth_middleware_1.optionalDemoAuth, (0, validate_middleware_1.validateParams)(PatientParamsSchema), dashboard_controller_1.dashboardController.getPatient);
exports.dashboardRouter.get('/patient/:id/vitals', auth_middleware_1.optionalDemoAuth, (0, validate_middleware_1.validateParams)(PatientParamsSchema), dashboard_controller_1.dashboardController.getVitals);
//# sourceMappingURL=dashboard.routes.js.map