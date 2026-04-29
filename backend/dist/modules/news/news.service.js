"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsService = void 0;
const date_fns_1 = require("date-fns");
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
const newsapi_client_1 = require("./newsapi.client");
exports.newsService = {
    async refreshNews() {
        const articles = await (0, newsapi_client_1.fetchIndianNews)();
        if (articles.length === 0)
            return;
        const today = (0, date_fns_1.startOfDay)(new Date()).toISOString();
        await supabase_1.supabase.from('news_cache').delete().gte('fetched_at', today);
        const { error } = await supabase_1.supabase.from('news_cache').insert(articles.map((article) => ({ headline: article.title, summary: article.description, source: article.source.name })));
        if (error)
            throw apiError_1.ApiError.internal('Failed to cache news');
    },
    async getLatestNews(limit = 5) {
        const today = (0, date_fns_1.startOfDay)(new Date()).toISOString();
        let { data, error } = await supabase_1.supabase.from('news_cache').select('*').gte('fetched_at', today).order('fetched_at', { ascending: false }).limit(limit);
        if (error)
            throw apiError_1.ApiError.internal('Failed to load news');
        if (!data || data.length === 0) {
            await this.refreshNews();
            const result = await supabase_1.supabase.from('news_cache').select('*').gte('fetched_at', today).order('fetched_at', { ascending: false }).limit(limit);
            data = result.data;
            error = result.error;
        }
        if (error)
            throw apiError_1.ApiError.internal('Failed to load news');
        if (!data || data.length === 0) {
            // Fallback: serve latest cached headlines even if today's refresh returned no rows.
            const fallback = await supabase_1.supabase.from('news_cache').select('*').order('fetched_at', { ascending: false }).limit(limit);
            if (fallback.error)
                throw apiError_1.ApiError.internal('Failed to load fallback news');
            data = fallback.data;
        }
        return data ?? [];
    }
};
//# sourceMappingURL=news.service.js.map