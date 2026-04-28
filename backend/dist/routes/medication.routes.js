"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicationRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const medication_controller_1 = require("../modules/medications/medication.controller");
const medication_types_1 = require("../modules/medications/medication.types");
const IdParamsSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
const PatientQuerySchema = zod_1.z.object({ patientId: zod_1.z.string().uuid() });
exports.medicationRouter = (0, express_1.Router)();
exports.medicationRouter.post('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateBody)(medication_types_1.CreateScheduleSchema), medication_controller_1.medicationController.create);
exports.medicationRouter.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateQuery)(PatientQuerySchema), medication_controller_1.medicationController.list);
exports.medicationRouter.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(IdParamsSchema), medication_controller_1.medicationController.delete);
exports.medicationRouter.post('/:id/trigger', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(IdParamsSchema), medication_controller_1.medicationController.trigger);
//# sourceMappingURL=medication.routes.js.map