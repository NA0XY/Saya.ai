"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const app_1 = require("./app");
const scheduler_1 = require("./jobs/scheduler");
const companion_websocket_1 = require("./modules/companion/companion.websocket");
const server = http_1.default.createServer(app_1.app);
const companionWebSocket = (0, companion_websocket_1.attachCompanionWebSocket)(server);
server.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`Saya.ai backend running on port ${env_1.env.PORT}`);
    (0, scheduler_1.startScheduler)();
});
function shutdown(signal) {
    logger_1.logger.info('[SERVER] Shutdown requested', { signal });
    companionWebSocket.close();
    server.close(() => {
        logger_1.logger.info('[SERVER] Shutdown complete');
        process.exit(0);
    });
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
//# sourceMappingURL=server.js.map