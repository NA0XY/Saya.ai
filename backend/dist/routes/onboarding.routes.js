"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const onboarding_controller_1 = require("../modules/onboarding/onboarding.controller");
const onboarding_validator_1 = require("../modules/onboarding/onboarding.validator");
const IdParamsSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
exports.onboardingRouter = (0, express_1.Router)();
exports.onboardingRouter.post('/patients', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateBody)(onboarding_validator_1.OnboardingSchema), onboarding_controller_1.onboardingController.createPatient);
exports.onboardingRouter.get('/patients', auth_middleware_1.authMiddleware, onboarding_controller_1.onboardingController.listPatients);
exports.onboardingRouter.get('/patients/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(IdParamsSchema), onboarding_controller_1.onboardingController.getPatient);
exports.onboardingRouter.patch('/patients/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(IdParamsSchema), (0, validate_middleware_1.validateBody)(onboarding_validator_1.CreatePatientSchema.partial()), onboarding_controller_1.onboardingController.updatePatient);
//# sourceMappingURL=onboarding.routes.js.map