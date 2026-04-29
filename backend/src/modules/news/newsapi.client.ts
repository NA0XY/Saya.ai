import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import type { NewsArticle } from './news.types';

type NewsDataArticle = {
  title?: string;
  description?: string | null;
  source_id?: string | null;
};

type NewsDataResponse = {
  results?: NewsDataArticle[];
};

function normalizeArticles(data: NewsDataResponse): NewsArticle[] {
  return (data.results ?? [])
    .map((article) => ({
      title: article.title?.trim() ?? '',
      description: article.description ?? null,
      source: { name: article.source_id?.trim() || 'NewsData' }
    }))
    .filter((article) => article.title.length > 0);
}

async function fetchFromNewsData(): Promise<NewsArticle[]> {
  const { data } = await axios.get<NewsDataResponse>('https://newsdata.io/api/1/news', {
    params: {
      country: 'in',
      language: 'en',
      category: 'top',
      size: 10,
      apikey: env.NEWS_API_KEY
    },
    timeout: env.NEWS_TIMEOUT_MS
  });

  return normalizeArticles(data);
}

export async function fetchIndianNews(): Promise<NewsArticle[]> {
  try {
    const articles = await fetchFromNewsData();
    if (articles.length > 0) return articles;
    logger.warn('[NEWS] NewsData returned no articles');
  } catch (error) {
    logger.warn('[NEWS] NewsData fetch failed', {
      error: error instanceof Error ? error.message : String(error)
    });
  }

  return [];
}
