import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import type { NewsApiResponse, NewsArticle } from './news.types';

export async function fetchIndianNews(): Promise<NewsArticle[]> {
  try {
    const { data } = await axios.get<NewsApiResponse>(`https://newsapi.org/v2/top-headlines?country=in&pageSize=10&apiKey=${env.NEWS_API_KEY}`, { timeout: env.NEWS_TIMEOUT_MS });
    return data.articles ?? [];
  } catch (error) {
    logger.warn('[NEWS] Fetch failed', { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}
