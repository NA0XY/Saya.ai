"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchIndianNews = fetchIndianNews;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
function normalizeArticles(data) {
    return (data.articles ?? [])
        .map((article) => ({
        title: article.title?.trim() ?? '',
        description: article.description ?? null,
        source: { name: article.source?.name?.trim() || 'News source' }
    }))
        .filter((article) => article.title.length > 0);
}
async function fetchFromNewsApi() {
    const { data } = await axios_1.default.get('https://newsapi.org/v2/top-headlines', {
        params: {
            country: 'in',
            pageSize: 10,
            apiKey: env_1.env.NEWS_API_KEY
        },
        timeout: env_1.env.NEWS_TIMEOUT_MS
    });
    return normalizeArticles(data);
}
async function fetchFromGNews() {
    const { data } = await axios_1.default.get('https://gnews.io/api/v4/top-headlines', {
        params: {
            country: 'in',
            lang: 'en',
            max: 10,
            token: env_1.env.NEWS_API_KEY
        },
        timeout: env_1.env.NEWS_TIMEOUT_MS
    });
    return normalizeArticles(data);
}
async function fetchIndianNews() {
    const providers = [
        { name: 'NewsAPI', fetch: fetchFromNewsApi },
        { name: 'GNews', fetch: fetchFromGNews }
    ];
    let lastError = null;
    for (const provider of providers) {
        try {
            const articles = await provider.fetch();
            if (articles.length > 0)
                return articles;
            logger_1.logger.warn('[NEWS] Provider returned no articles', { provider: provider.name });
        }
        catch (error) {
            lastError = error;
            logger_1.logger.warn('[NEWS] Fetch failed', {
                provider: provider.name,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    if (lastError) {
        logger_1.logger.warn('[NEWS] All providers failed', {
            error: lastError instanceof Error ? lastError.message : String(lastError)
        });
    }
    return [];
}
//# sourceMappingURL=newsapi.client.js.map