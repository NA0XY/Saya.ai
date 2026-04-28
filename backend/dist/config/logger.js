"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_1 = __importDefault(require("winston"));
const env_1 = require("./env");
const logFormat = winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    const context = Object.keys(meta).length ? ` -- ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${context}`;
});
const transports = [];
if (env_1.env.NODE_ENV === 'production') {
    const logDir = path_1.default.resolve(process.cwd(), 'logs');
    fs_1.default.mkdirSync(logDir, { recursive: true });
    transports.push(new winston_1.default.transports.File({ filename: path_1.default.join(logDir, 'error.log'), level: 'error' }));
    transports.push(new winston_1.default.transports.File({ filename: path_1.default.join(logDir, 'combined.log') }));
}
else {
    transports.push(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp(), logFormat)
    }));
}
exports.logger = winston_1.default.createLogger({
    level: env_1.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), logFormat),
    transports
});
//# sourceMappingURL=logger.js.map