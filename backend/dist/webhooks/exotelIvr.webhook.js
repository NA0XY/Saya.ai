"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleExotelIvr = handleExotelIvr;
const logger_1 = require("../config/logger");
const call_service_1 = require("../modules/calls/call.service");
async function handleExotelIvr(req, res) {
    const payload = req.body;
    logger_1.logger.info('[WEBHOOK] Exotel IVR received', { body: payload });
    await call_service_1.callService.handleIvrResponse(payload);
    const message = payload.Digits === '1'
        ? 'Dhanyawaad. Humne aapke parivaar ko suchit kar diya. Thank you. Your family has been notified.'
        : 'Theek hai. Kripya jaldi apni dawai lein. Okay. Please take your medicine soon.';
    res.type('text/xml').send(`<Response><Say>${message}</Say></Response>`);
}
//# sourceMappingURL=exotelIvr.webhook.js.map