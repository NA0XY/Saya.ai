"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const apiResponse_1 = require("../../utils/apiResponse");
const auth_service_1 = require("./auth.service");
exports.authController = {
    register: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.register(req.body);
        res.status(201).json((0, apiResponse_1.successResponse)(result, 'Registered successfully'));
    }),
    login: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.login(req.body);
        res.json((0, apiResponse_1.successResponse)(result, 'Logged in successfully'));
    }),
    me: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await auth_service_1.authService.getUserById(req.user.id);
        res.json((0, apiResponse_1.successResponse)(user));
    })
};
//# sourceMappingURL=auth.controller.js.map