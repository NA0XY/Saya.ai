"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companionController = void 0;
const apiResponse_1 = require("../../utils/apiResponse");
const asyncHandler_1 = require("../../utils/asyncHandler");
const companion_service_1 = require("./companion.service");
exports.companionController = {
    chat: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const response = await companion_service_1.companionService.chat(req.body, req.user.id);
        res.json((0, apiResponse_1.successResponse)(response));
    }),
    getHistory: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const history = await companion_service_1.companionService.getHistory(req.params.patientId, 50);
        res.json((0, apiResponse_1.successResponse)(history));
    })
};
//# sourceMappingURL=companion.controller.js.map