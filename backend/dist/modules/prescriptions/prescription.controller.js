"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prescriptionController = void 0;
const apiError_1 = require("../../utils/apiError");
const apiResponse_1 = require("../../utils/apiResponse");
const asyncHandler_1 = require("../../utils/asyncHandler");
const prescription_service_1 = require("./prescription.service");
exports.prescriptionController = {
    upload: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const patientId = req.body.patientId ?? req.query.patientId;
        if (!patientId)
            throw apiError_1.ApiError.badRequest('patientId is required');
        const result = await prescription_service_1.prescriptionService.uploadAndProcess(req.file, patientId, req.user.id);
        res.status(201).json((0, apiResponse_1.successResponse)(result, 'Prescription uploaded. Caregiver verification is required before safety warnings activate.'));
    }),
    verify: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const prescription = await prescription_service_1.prescriptionService.verifyPrescription(req.params.id, req.body, req.user.id);
        res.json((0, apiResponse_1.successResponse)(prescription, 'Prescription verified'));
    }),
    getOne: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const prescription = await prescription_service_1.prescriptionService.getPrescription(req.params.id, req.user.id);
        res.json((0, apiResponse_1.successResponse)(prescription));
    }),
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.query.patientId)
            throw apiError_1.ApiError.badRequest('patientId query parameter is required');
        const prescriptions = await prescription_service_1.prescriptionService.listPrescriptions(req.query.patientId, req.user?.id ?? '', req.query.demo === 'true');
        res.json((0, apiResponse_1.successResponse)(prescriptions));
    })
};
//# sourceMappingURL=prescription.controller.js.map