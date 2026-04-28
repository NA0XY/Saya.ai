import type { NewsCache } from '../../types/database';
export declare const newsService: {
    refreshNews(): Promise<void>;
    getLatestNews(limit?: number): Promise<NewsCache[]>;
};
//# sourceMappingURL=news.service.d.ts.map