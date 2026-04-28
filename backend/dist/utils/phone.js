"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toE164India = toE164India;
exports.isValidIndianPhone = isValidIndianPhone;
exports.maskPhone = maskPhone;
const apiError_1 = require("./apiError");
function toE164India(phone) {
    const stripped = phone.replace(/[\s\-()]/g, '');
    let normalized = stripped;
    if (/^\d{10}$/.test(normalized))
        normalized = `+91${normalized}`;
    if (/^0\d{10}$/.test(normalized))
        normalized = `+91${normalized.slice(1)}`;
    if (/^91\d{10}$/.test(normalized))
        normalized = `+${normalized}`;
    if (!isValidIndianPhone(normalized))
        throw apiError_1.ApiError.badRequest('Invalid Indian mobile number');
    return normalized;
}
function isValidIndianPhone(phone) {
    return /^\+91[6-9]\d{9}$/.test(phone);
}
function maskPhone(phone) {
    const normalized = phone.replace(/[\s\-()]/g, '');
    if (normalized.length <= 8)
        return normalized;
    return `${normalized.slice(0, 5)}XXXX...${normalized.slice(-4)}`;
}
//# sourceMappingURL=phone.js.map