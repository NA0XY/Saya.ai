"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleExotelStatus = handleExotelStatus;
const logger_1 = require("../config/logger");
const call_service_1 = require("../modules/calls/call.service");
async function handleExotelStatus(req, res) {
    const payload = req.body;
    logger_1.logger.info('[WEBHOOK] Exotel status received', { body: payload });
    await call_service_1.callService.handleCallStatusUpdate(payload);
    res.status(200).end();
}
//# sourceMappingURL=exotelStatus.webhook.js.map