import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import type { NewsArticle } from './news.types';

export async function fetchIndianNews(): Promise<NewsArticle[]> {
  try {
    const { data } = await axios.get<{
      articles?: Array<{
        title?: string;
        description?: string | null;
        source?: { name?: string | null };
      }>;
    }>(
      'https://gnews.io/api/v4/top-headlines',
      {
        params: {
          country: 'in',
          lang: 'en',
          max: 10,
          token: env.NEWS_API_KEY
        },
        timeout: env.NEWS_TIMEOUT_MS
      }
    );
    return (data.articles ?? [])
      .map((article) => ({
        title: article.title?.trim() ?? '',
        description: article.description ?? null,
        source: { name: article.source?.name?.trim() || 'GNews' }
      }))
      .filter((article) => article.title.length > 0);
  } catch (error) {
    logger.warn('[NEWS] Fetch failed', { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}
