import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type SentimentTag = "joy" | "neutral" | "anxiety" | "sadness";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentiment?: SentimentTag;
  timestamp: Date | string;
  input_source?: "voice" | "text";
  turn_metrics?: {
    capture_ms?: number;
    stt_ms?: number;
    first_token_ms?: number;
    tts_first_byte_ms?: number;
  };
};

type ChatHistoryProps = {
  messages: ChatMessage[];
  loading?: boolean;
  error?: string | null;
};

const SENTIMENT_EMOJI: Record<SentimentTag, string> = {
  joy: "😊",
  sadness: "😔",
  anxiety: "😟",
  neutral: "🙂",
};

function relativeTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (deltaSeconds < 60) return "Just now";
  if (deltaSeconds < 3600) return `${Math.floor(deltaSeconds / 60)} min ago`;
  if (deltaSeconds < 86400) return `${Math.floor(deltaSeconds / 3600)} hr ago`;
  return `${Math.floor(deltaSeconds / 86400)} day ago`;
}

export function ChatHistory({ messages, loading = false, error = null }: ChatHistoryProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const renderedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        timestampLabel: relativeTime(message.timestamp),
      })),
    [messages]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
    if (nearBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [renderedMessages.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
      setShowScrollButton(!nearBottom);
    };
    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative w-full rounded-2xl border border-[#E85D2A]/20 bg-white shadow-sm transition-all duration-300">
      <div ref={containerRef} className="max-h-[60vh] lg:max-h-[400px] overflow-y-auto px-4 py-4 space-y-4">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={`chat-loading-${item}`} className="h-16 w-full rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-[#E85D2A]/20 bg-[#F5F1EA] px-4 py-3 text-sm font-semibold text-[#83311A]">
            Couldn&apos;t load conversation history right now.
          </div>
        )}

        {!loading && !error && renderedMessages.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
            <span className="text-4xl">👋</span>
            <p className="text-lg font-medium">Say hello to start chatting!</p>
          </div>
        )}

        {!loading &&
          !error &&
          renderedMessages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"} transition-all duration-300`}>
                <div
                  className={`max-w-[90%] px-4 py-3 border text-sm lg:text-base ${
                    isUser
                      ? "bg-white border-gray-100 rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl rounded-br-sm text-[#2A2B3D]"
                      : "bg-[#E85D2A]/10 border-[#E85D2A]/20 rounded-tl-2xl rounded-bl-sm rounded-tr-2xl rounded-br-2xl text-[#2A2B3D]"
                  }`}
                >
                  <p className="font-semibold leading-relaxed">{message.content}</p>
                  <div className={`mt-2 flex items-center gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser && (
                      <span aria-label={`Sentiment ${message.sentiment ?? "neutral"}`} className="text-sm">
                        {SENTIMENT_EMOJI[message.sentiment ?? "neutral"]}
                      </span>
                    )}
                    <span className="text-sm text-[#7A6A63] font-semibold">{message.timestampLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      {showScrollButton && renderedMessages.length > 0 && (
        <button
          type="button"
          aria-label="Scroll to latest message"
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })}
          className="absolute bottom-4 right-4 rounded-full bg-[#E85D2A] text-white p-2 shadow-md hover:bg-[#83311A] transition-all duration-300"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}
