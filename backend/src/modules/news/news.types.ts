export interface NewsArticle {
  title: string;
  description: string | null;
  source: { name: string };
}

export interface NewsApiResponse {
  articles: NewsArticle[];
}
