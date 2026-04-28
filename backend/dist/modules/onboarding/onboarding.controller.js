"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingController = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const asyncHandler_1 = require("../../utils/asyncHandler");
const onboarding_service_1 = require("./onboarding.service");
exports.onboardingController = {
    createPatient: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const patient = await onboarding_service_1.onboardingService.createPatientWithContacts(req.user.id, req.body);
        res.status(201).json((0, apiResponse_1.successResponse)(patient, 'Patient created'));
    }),
    getPatient: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const patient = await onboarding_service_1.onboardingService.getPatient(req.params.id, req.user.id);
        res.json((0, apiResponse_1.successResponse)(patient));
    }),
    listPatients: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const patients = await onboarding_service_1.onboardingService.listPatients(req.user.id);
        res.json((0, apiResponse_1.successResponse)(patients));
    }),
    updatePatient: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const patient = await onboarding_service_1.onboardingService.updatePatient(req.params.id, req.user.id, req.body);
        res.json((0, apiResponse_1.successResponse)(patient, 'Patient updated'));
    })
};
//# sourceMappingURL=onboarding.controller.js.map