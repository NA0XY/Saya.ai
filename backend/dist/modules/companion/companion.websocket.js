"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachCompanionWebSocket = attachCompanionWebSocket;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const ws_1 = require("ws");
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const companion_service_1 = require("./companion.service");
function send(ws, payload) {
    if (ws.readyState === ws_1.WebSocket.OPEN)
        ws.send(JSON.stringify(payload));
}
function parseToken(token) {
    if (!token)
        throw new Error('Missing token');
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
}
function parseMessage(raw) {
    const parsed = JSON.parse(raw.toString());
    if (!parsed.message || typeof parsed.message !== 'string')
        throw new Error('message is required');
    if (parsed.language && parsed.language !== 'hi' && parsed.language !== 'en')
        throw new Error('language must be hi or en');
    return { message: parsed.message, language: parsed.language ?? 'hi' };
}
function attachCompanionWebSocket(server) {
    const wss = new ws_1.WebSocketServer({ server, path: '/ws/companion' });
    wss.on('connection', (ws, req) => {
        const url = new URL(req.url ?? '', env_1.env.BACKEND_URL);
        const patientId = url.searchParams.get('patientId');
        let user;
        try {
            user = parseToken(url.searchParams.get('token'));
            if (!patientId)
                throw new Error('Missing patientId');
        }
        catch (error) {
            const code = error instanceof jsonwebtoken_1.TokenExpiredError ? 'TOKEN_EXPIRED' : error instanceof jsonwebtoken_1.JsonWebTokenError ? 'INVALID_TOKEN' : 'BAD_WEBSOCKET_REQUEST';
            send(ws, { type: 'error', code, message: 'WebSocket authentication failed' });
            ws.close(1008, code);
            return;
        }
        send(ws, { type: 'ready', patient_id: patientId });
        ws.on('message', async (raw) => {
            try {
                const input = parseMessage(raw);
                const response = await companion_service_1.companionService.chat({ patient_id: patientId, message: input.message, language: input.language ?? 'hi' }, user.id);
                send(ws, { type: 'chat_response', data: response });
            }
            catch (error) {
                logger_1.logger.error('[COMPANION_WS] Message handling failed', { patientId, userId: user.id, error: error instanceof Error ? error.message : String(error) });
                send(ws, { type: 'error', code: 'COMPANION_CHAT_FAILED', message: error instanceof Error ? error.message : 'Companion chat failed' });
            }
        });
    });
    logger_1.logger.info('[COMPANION_WS] WebSocket server attached', { path: '/ws/companion' });
    return wss;
}
//# sourceMappingURL=companion.websocket.js.map