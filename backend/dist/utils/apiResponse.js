"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.paginatedResponse = paginatedResponse;
function successResponse(data, message = 'Success') {
    return { success: true, message, data };
}
function paginatedResponse(data, total, page, limit) {
    return {
        success: true,
        data,
        pagination: { total, page, limit, hasMore: page * limit < total }
    };
}
//# sourceMappingURL=apiResponse.js.map