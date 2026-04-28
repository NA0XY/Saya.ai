import { useMemo, useState } from "react";
import { X } from "lucide-react";

export type NewsItem = {
  id: string;
  headline: string;
  summary?: string | null;
  source?: string | null;
  published_at?: string;
  fetched_at?: string;
  category?: string | null;
};

type NewsTickerProps = {
  news: NewsItem[];
  loading?: boolean;
  error?: string | null;
};

export function NewsTicker({ news, loading = false, error = null }: NewsTickerProps) {
  const [selectedHeadline, setSelectedHeadline] = useState<NewsItem | null>(null);
  const [paused, setPaused] = useState(false);

  const animationDuration = useMemo(() => `${40 + news.length * 5}s`, [news.length]);

  if (loading) {
    return <div className="h-12 w-full bg-gray-200 animate-pulse rounded-b-2xl" />;
  }

  if (error || news.length === 0) {
    return (
      <div className="w-full bg-[#2A2B3D] px-4 py-3 text-center text-sm font-bold tracking-wider uppercase text-white">
        News updates unavailable right now
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-hidden bg-[#2A2B3D] border-b border-white/10">
        <div
          className="whitespace-nowrap py-3 transition-all duration-300"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            animation: `ticker ${animationDuration} linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {news.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Open headline: ${item.headline}`}
              onClick={() => setSelectedHeadline(item)}
              className="inline-flex items-center text-white text-sm font-bold tracking-wider uppercase px-4 hover:text-[#E9C46A] transition-all duration-300"
            >
              <span>{item.headline}</span>
              {index < news.length - 1 && <span className="ml-4 text-white/70">•</span>}
            </button>
          ))}
        </div>
      </div>

      {selectedHeadline && (
        <div className="fixed inset-0 z-40 bg-black/30 px-4 py-8 flex items-start justify-center">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-[#E85D2A]/20 p-6 transition-all duration-300">
            <div className="flex items-start gap-3">
              <h3 className="flex-1 text-lg font-bold tracking-tight uppercase text-[#2A2B3D]">
                {selectedHeadline.headline}
              </h3>
              <button
                type="button"
                aria-label="Close headline details"
                onClick={() => setSelectedHeadline(null)}
                className="rounded-full p-1 text-[#83311A] hover:bg-[#F5F1EA] transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-[#7A6A63] font-semibold">
              {selectedHeadline.source ?? "Unknown source"}
            </p>
            <p className="mt-4 text-base text-[#2A2B3D] font-semibold">
              {selectedHeadline.summary ?? "No summary available for this headline yet."}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </>
  );
}
