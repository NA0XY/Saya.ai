"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const asyncHandler_1 = require("../../utils/asyncHandler");
const dashboard_service_1 = require("./dashboard.service");
const demoVitals_service_1 = require("./demoVitals.service");
exports.dashboardController = {
    getSummary: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = await dashboard_service_1.dashboardService.getDashboardData(req.user?.id ?? 'demo-caregiver-uuid', req.query.demo === 'true');
        res.json((0, apiResponse_1.successResponse)(data));
    }),
    getPatient: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = await dashboard_service_1.dashboardService.getPatientDashboard(req.params.id, req.user?.id ?? 'demo-caregiver-uuid', req.query.demo === 'true');
        res.json((0, apiResponse_1.successResponse)(data));
    }),
    getVitals: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = await demoVitals_service_1.demoVitalsService.getDemoVitals(req.params.id, req.query.metric);
        res.json((0, apiResponse_1.successResponse)(data));
    })
};
//# sourceMappingURL=dashboard.controller.js.map