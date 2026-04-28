import { startOfDay } from 'date-fns';
import { supabase } from '../../config/supabase';
import type { NewsCache } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { fetchIndianNews } from './newsapi.client';

export const newsService = {
  async refreshNews(): Promise<void> {
    const today = startOfDay(new Date()).toISOString();
    await supabase.from('news_cache').delete().gte('fetched_at', today);
    const articles = await fetchIndianNews();
    if (articles.length === 0) return;
    const { error } = await supabase.from('news_cache').insert(articles.map((article) => ({ headline: article.title, summary: article.description, source: article.source.name })));
    if (error) throw ApiError.internal('Failed to cache news');
  },
  async getLatestNews(limit = 5): Promise<NewsCache[]> {
    const today = startOfDay(new Date()).toISOString();
    let { data, error } = await supabase.from('news_cache').select('*').gte('fetched_at', today).order('fetched_at', { ascending: false }).limit(limit);
    if (error) throw ApiError.internal('Failed to load news');
    if (!data || data.length === 0) {
      await this.refreshNews();
      const result = await supabase.from('news_cache').select('*').gte('fetched_at', today).order('fetched_at', { ascending: false }).limit(limit);
      data = result.data;
      error = result.error;
    }
    if (error) throw ApiError.internal('Failed to load news');
    if (!data || data.length === 0) {
      // Fallback: serve latest cached headlines even if today's refresh returned no rows.
      const fallback = await supabase.from('news_cache').select('*').order('fetched_at', { ascending: false }).limit(limit);
      if (fallback.error) throw ApiError.internal('Failed to load fallback news');
      data = fallback.data;
    }
    return data ?? [];
  }
};
