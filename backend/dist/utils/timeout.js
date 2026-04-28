"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTimeout = withTimeout;
const apiError_1 = require("./apiError");
async function withTimeout(promise, timeoutMs, code, message) {
    let timeout;
    const timer = new Promise((_resolve, reject) => {
        timeout = setTimeout(() => reject(apiError_1.ApiError.serviceUnavailable(message, { timeoutMs }, code)), timeoutMs);
    });
    try {
        return await Promise.race([promise, timer]);
    }
    finally {
        if (timeout)
            clearTimeout(timeout);
    }
}
//# sourceMappingURL=timeout.js.map