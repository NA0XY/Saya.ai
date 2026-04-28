"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicationController = void 0;
const apiError_1 = require("../../utils/apiError");
const apiResponse_1 = require("../../utils/apiResponse");
const asyncHandler_1 = require("../../utils/asyncHandler");
const medication_service_1 = require("./medication.service");
exports.medicationController = {
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const schedule = await medication_service_1.medicationService.createSchedule(req.body, req.user.id);
        res.status(201).json((0, apiResponse_1.successResponse)(schedule, 'Medication schedule created'));
    }),
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.query.patientId)
            throw apiError_1.ApiError.badRequest('patientId query parameter is required');
        const schedules = await medication_service_1.medicationService.listSchedules(req.query.patientId, req.user.id);
        res.json((0, apiResponse_1.successResponse)(schedules));
    }),
    trigger: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const log = await medication_service_1.medicationService.triggerImmediateCall(req.params.id, req.user.id);
        res.json((0, apiResponse_1.successResponse)(log, 'Call triggered'));
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await medication_service_1.medicationService.deleteSchedule(req.params.id, req.user.id);
        res.json((0, apiResponse_1.successResponse)({ id: req.params.id }, 'Medication schedule deactivated'));
    })
};
//# sourceMappingURL=medication.controller.js.map