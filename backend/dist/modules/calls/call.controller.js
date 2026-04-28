"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callController = void 0;
const apiError_1 = require("../../utils/apiError");
const apiResponse_1 = require("../../utils/apiResponse");
const asyncHandler_1 = require("../../utils/asyncHandler");
const medication_repository_1 = require("../medications/medication.repository");
const call_service_1 = require("./call.service");
exports.callController = {
    getCallLogs: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.query.scheduleId)
            throw apiError_1.ApiError.badRequest('scheduleId query parameter is required');
        const [logs, retryJobs] = await Promise.all([
            medication_repository_1.medicationRepository.findCallLogsBySchedule(req.query.scheduleId),
            medication_repository_1.medicationRepository.findRetryJobsBySchedule(req.query.scheduleId)
        ]);
        res.json((0, apiResponse_1.successResponse)({ call_logs: logs, retry_jobs: retryJobs }));
    }),
    triggerCall: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.body.scheduleId)
            throw apiError_1.ApiError.badRequest('scheduleId is required');
        const log = await call_service_1.callService.initiateCall(req.body.scheduleId, 1);
        res.json((0, apiResponse_1.successResponse)(log, 'Call triggered'));
    })
};
//# sourceMappingURL=call.controller.js.map