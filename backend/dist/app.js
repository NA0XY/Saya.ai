"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("./config/env");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_2 = require("./config/cors");
const logger_1 = require("./config/logger");
const error_middleware_1 = require("./middleware/error.middleware");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const requestId_middleware_1 = require("./middleware/requestId.middleware");
const routes_1 = require("./routes");
const webhook_routes_1 = require("./routes/webhook.routes");
const supabase_1 = require("./config/supabase");
const apiError_1 = require("./utils/apiError");
exports.app = (0, express_1.default)();
exports.app.use(requestId_middleware_1.requestIdMiddleware);
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)(cors_2.corsOptions));
exports.app.use((0, morgan_1.default)('combined', { stream: { write: (msg) => logger_1.logger.info(msg.trim()) } }));
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
exports.app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
exports.app.use(rateLimit_middleware_1.generalLimiter);
exports.app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
exports.app.get('/ready', async (_req, res) => {
    const startedAt = Date.now();
    const { error } = await supabase_1.supabase.from('users').select('id', { count: 'exact', head: true }).limit(1);
    res.status(error ? 503 : 200).json({
        status: error ? 'degraded' : 'ready',
        checks: {
            env: true,
            supabase: !error
        },
        latency_ms: Date.now() - startedAt
    });
});
exports.app.use('/api', routes_1.router);
exports.app.use('/webhooks', webhook_routes_1.webhookRouter);
exports.app.use((_req, _res, next) => next(apiError_1.ApiError.notFound('Route')));
exports.app.use(error_middleware_1.errorMiddleware);
//# sourceMappingURL=app.js.map