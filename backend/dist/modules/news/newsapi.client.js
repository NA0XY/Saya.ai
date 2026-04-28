"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchIndianNews = fetchIndianNews;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
async function fetchIndianNews() {
    try {
        const { data } = await axios_1.default.get(`https://newsapi.org/v2/top-headlines?country=in&pageSize=10&apiKey=${env_1.env.NEWS_API_KEY}`, { timeout: env_1.env.NEWS_TIMEOUT_MS });
        return data.articles ?? [];
    }
    catch (error) {
        logger_1.logger.warn('[NEWS] Fetch failed', { error: error instanceof Error ? error.message : String(error) });
        return [];
    }
}
//# sourceMappingURL=newsapi.client.js.map