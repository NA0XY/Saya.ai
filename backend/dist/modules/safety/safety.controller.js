"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyController = void 0;
const zod_1 = require("zod");
const apiResponse_1 = require("../../utils/apiResponse");
const asyncHandler_1 = require("../../utils/asyncHandler");
const safety_service_1 = require("./safety.service");
const SafetyCheckSchema = zod_1.z.object({ drug_names: zod_1.z.array(zod_1.z.string().min(1)).min(1) });
exports.safetyController = {
    getWarnings: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const prescriptionId = req.params.prescriptionId ?? req.params.id;
        const report = req.query.demo === 'true' || prescriptionId.startsWith('demo-') ? await safety_service_1.safetyService.demoReport(prescriptionId) : await safety_service_1.safetyService.getSafetyReportForPrescription(prescriptionId, req.user.id);
        res.json((0, apiResponse_1.successResponse)(report));
    }),
    checkDrugs: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const input = SafetyCheckSchema.parse(req.body);
        const report = await safety_service_1.safetyService.checkDrugs(input.drug_names);
        res.json((0, apiResponse_1.successResponse)(report));
    })
};
//# sourceMappingURL=safety.controller.js.map