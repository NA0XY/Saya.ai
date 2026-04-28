import { useEffect, useMemo, useRef, useState } from "react";

export type PatientMemory = {
  id: string;
  memory_key: string;
  memory_value: string;
  created_at?: string;
  updated_at?: string;
};

type MemoryPanelProps = {
  memories: PatientMemory[];
  loading?: boolean;
  error?: string | null;
  className?: string;
};

function getMemoryEmoji(key: string): string {
  if (key.startsWith("favourite_drink")) return "☕";
  if (key.startsWith("mood_") || key.includes("mood")) return "💭";
  if (key.includes("food") || key.includes("snack")) return "🍽️";
  if (key.startsWith("family_")) return "👨‍👩‍👦";
  return "🧠";
}

export function MemoryPanel({ memories, loading = false, error = null, className = "" }: MemoryPanelProps) {
  const [expanded, setExpanded] = useState<boolean>(() => (typeof window !== "undefined" ? window.innerWidth >= 1024 : false));
  const [showToast, setShowToast] = useState(false);
  const previousCountRef = useRef(memories.length);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      if (window.innerWidth >= 1024) setExpanded(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (memories.length > previousCountRef.current) {
      setShowToast(true);
      const timer = window.setTimeout(() => setShowToast(false), 3000);
      previousCountRef.current = memories.length;
      return () => window.clearTimeout(timer);
    }
    previousCountRef.current = memories.length;
    return undefined;
  }, [memories.length]);

  const sortedMemories = useMemo(
    () => [...memories].sort((a, b) => a.memory_key.localeCompare(b.memory_key)),
    [memories]
  );

  return (
    <section className={`w-full rounded-2xl bg-white border border-[#E85D2A]/20 shadow-sm transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-sm lg:text-base font-bold tracking-tight uppercase text-[#2A2B3D]">
          What I Remember About You
        </h3>
        <button
          type="button"
          aria-label={expanded ? "Collapse memories panel" : "Expand memories panel"}
          onClick={() => setExpanded((value) => !value)}
          className="text-sm font-bold text-[#E85D2A] hover:text-[#83311A] transition-all duration-300"
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </div>

      {showToast && (
        <div className="mx-5 mb-3 rounded-2xl bg-[#E9C46A]/30 border border-[#E9C46A] px-4 py-3 text-sm font-semibold text-[#83311A] transition-all duration-300">
          ✨ I&apos;ll remember that!
        </div>
      )}

      {expanded && (
        <div className="px-5 pb-5 transition-all duration-300">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={`memory-skeleton-${item}`} className="h-10 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-[#E85D2A]/20 bg-[#F5F1EA] px-4 py-3 text-sm font-semibold text-[#83311A]">
              Couldn&apos;t load memories right now.
            </div>
          )}

          {!loading && !error && sortedMemories.length === 0 && (
            <div className="rounded-2xl border border-[#E85D2A]/10 bg-[#F5F1EA] px-4 py-3 text-sm font-semibold text-[#7A6A63]">
              I&apos;ll start remembering details as we chat.
            </div>
          )}

          {!loading && !error && sortedMemories.length > 0 && (
            <ul className="space-y-3">
              {sortedMemories.map((memory) => (
                <li
                  key={`${memory.memory_key}-${memory.id}`}
                  className="rounded-2xl border border-[#E85D2A]/10 bg-[#F5F1EA] px-4 py-3 text-sm lg:text-base text-[#2A2B3D] transition-all duration-300"
                >
                  <span className="mr-2">{getMemoryEmoji(memory.memory_key)}</span>
                  <span className="font-bold text-[#83311A]">{memory.memory_key}</span>
                  <span className="mx-1 text-[#7A6A63]">:</span>
                  <span className="font-semibold">{memory.memory_value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
