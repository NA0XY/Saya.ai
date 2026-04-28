import { useState, useRef, useEffect } from "react";

const DRUG_BRANDS = [
  "Dolo-650", "Telma-AM 40", "Crocin Advance", "Ecosprin-75",
  "Metformin 500mg", "Metoprolol 25mg", "Atorva-10", "Amlodipine 5mg",
  "Cipcal-500", "Pan-D", "Glycomet GP-2", "Thyronorm 50mcg",
  "Shelcal-500", "Azithral 500", "Jhandu Baam",
];

type ScheduledEntry = {
  id: string;
  medicine: string;
  voice: string;
  time: string;
};

export function GuardianCallerPanel() {
  const [stage, setStage] = useState<1 | 2>(1);

  /* Stage 1 form */
  const [medicine, setMedicine] = useState("");
  const [time, setTime] = useState("");
  const [voice, setVoice] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  /* Stage 2 entries */
  const [entries, setEntries] = useState<ScheduledEntry[]>([]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDrop(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = DRUG_BRANDS.filter(d =>
    d.toLowerCase().includes(medicine.toLowerCase())
  );

  const fmt = (t: string) => {
    if (!t) return "--:--";
    const [h, m] = t.split(":").map(Number);
    const hr = h.toString().padStart(2, "0");
    const mn = m.toString().padStart(2, "0");
    return `${hr}:${mn}`;
  };

  const handleSchedule = () => {
    if (!medicine.trim() || !time) return;
    setEntries(prev => [...prev, {
      id: Date.now().toString(),
      medicine: medicine.trim(),
      voice: voice.trim(),
      time,
    }]);
    setMedicine("");
    setVoice("");
    setTime("");
    setStage(2);
  };

  const handleAdd = () => setStage(1);

  /* ── expand / collapse icon ── */
  const ExpandIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" /><line x1="14" y1="10" x2="21" y2="3" />
    </svg>
  );
  const CollapseIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 14 10 14 10 20" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );

  return (
    <div className="animate-fade-in">

      {/* ═══ STAGE 1 — Schedule a Reminder ═══ */}
      {stage === 1 && (
        <div
          className="bg-[#F5F1EA] p-8 max-w-2xl mx-auto"
          style={{
            border: "3px solid #1a1a1a",
            borderRadius: "6px",
            filter: "url(#rough)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-sketch font-bold text-2xl text-[#1a1a1a] italic uppercase tracking-wide">
                Schedule a Reminder
              </h3>
              <p className="font-sketch text-sm text-[#83311A]/60 mt-0.5">
                Set medicine time &amp; voice message
              </p>
            </div>
            {entries.length > 0 && (
              <button onClick={() => setStage(2)} className="text-[#1a1a1a] hover:text-[#D94F2B] transition-colors mt-1" aria-label="View upcoming calls">
                <ExpandIcon />
              </button>
            )}
          </div>

          <div className="mt-6 space-y-5">
            {/* Medicine Name */}
            <div ref={dropRef} className="relative">
              <label className="block font-sketch font-bold text-base text-[#1a1a1a] italic mb-1.5">
                Medicine Name
              </label>
              <div
                className="bg-[#F5F1EA]"
                style={{ border: "1.5px solid #c5bfb3", borderRadius: "4px", filter: "url(#rough)" }}
              >
                <input
                  type="text"
                  value={medicine}
                  onChange={e => { setMedicine(e.target.value); setShowDrop(true); }}
                  onFocus={() => setShowDrop(true)}
                  placeholder="e.g. Metoprolol 25mg"
                  className="w-full px-4 py-3 bg-transparent focus:outline-none font-sketch text-base text-[#1a1a1a] placeholder-[#83311A]/40"
                />
              </div>
              {showDrop && medicine && filtered.length > 0 && (
                <div
                  className="absolute z-30 top-full left-0 right-0 mt-1 bg-white shadow-lg max-h-40 overflow-y-auto"
                  style={{ border: "1.5px solid #c5bfb3", borderRadius: "4px", filter: "url(#rough)" }}
                >
                  {filtered.map(d => (
                    <button key={d} onMouseDown={() => { setMedicine(d); setShowDrop(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#D94F2B]/5 font-sketch text-base text-[#1a1a1a] transition-colors">
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Call Time */}
            <div>
              <label className="block font-sketch font-bold text-base text-[#1a1a1a] italic mb-1.5">
                Call Time
              </label>
              <div
                className="bg-[#F5F1EA] flex items-center"
                style={{ border: "1.5px solid #c5bfb3", borderRadius: "4px", filter: "url(#rough)" }}
              >
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  placeholder="--:---"
                  className="flex-1 px-4 py-3 bg-transparent focus:outline-none font-sketch text-base text-[#1a1a1a]"
                  style={{ colorScheme: "light" }}
                />
                <div className="pr-3 text-[#83311A]/40">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Voice Message */}
            <div>
              <label className="block font-sketch font-bold text-base text-[#1a1a1a] italic mb-1.5">
                Voice Message (optional)
              </label>
              <div
                className="bg-[#F5F1EA]"
                style={{ border: "1.5px solid #c5bfb3", borderRadius: "4px", filter: "url(#rough)" }}
              >
                <textarea
                  rows={4}
                  value={voice}
                  onChange={e => setVoice(e.target.value)}
                  placeholder="e.g. Namaste Papa, apni goli le lijiye..."
                  className="w-full px-4 py-3 bg-transparent focus:outline-none font-sketch text-base text-[#1a1a1a] placeholder-[#83311A]/40 resize-y"
                />
              </div>
            </div>

            {/* Schedule Call */}
            <button
              onClick={handleSchedule}
              disabled={!medicine.trim() || !time}
              className="w-full py-4 font-sketch font-bold text-xl tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
              style={{
                background: "#D94F2B",
                color: "#fff",
                border: "2px solid #83311A",
                borderRadius: "6px",
                filter: "url(#rough)",
              }}
            >
              <span className="flex items-center justify-center gap-2">
                Schedule Call
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ═══ STAGE 2 — Upcoming Calls ═══ */}
      {stage === 2 && (
        <div
          className="bg-[#F5F1EA] p-8 max-w-2xl mx-auto"
          style={{
            border: "3px solid #1a1a1a",
            borderRadius: "6px",
            filter: "url(#rough)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-sketch font-bold text-2xl text-[#1a1a1a] italic uppercase tracking-wide">
                Upcoming Calls
              </h3>
              <p className="font-sketch text-sm text-[#83311A]/60 mt-0.5">
                Today &middot; ordered by schedule
              </p>
            </div>
            <button onClick={handleAdd} className="text-[#1a1a1a] hover:text-[#D94F2B] transition-colors mt-1" aria-label="Schedule new reminder">
              <CollapseIcon />
            </button>
          </div>

          {/* Call list */}
          <div className="mt-6 max-h-[420px] overflow-y-auto overflow-x-hidden space-y-0">
            {[...entries]
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((entry, idx) => {
                const isFirst = idx === 0;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-start gap-6 py-4 group ${
                      isFirst
                        ? "rounded-md px-4"
                        : "border-b border-[#83311A]/10"
                    }`}
                    style={isFirst ? {
                      background: "rgba(217, 79, 43, 0.08)",
                      border: "1.5px solid rgba(217, 79, 43, 0.2)",
                      borderRadius: "6px",
                      filter: "url(#rough)",
                    } : {}}
                  >
                    {/* Time */}
                    <div className="flex-shrink-0 w-14 pt-0.5">
                      <span className="font-sketch font-bold text-lg text-[#3F48CC]">
                        {fmt(entry.time)}
                      </span>
                    </div>

                    {/* Medicine + voice */}
                    <div className="flex-1 min-w-0">
                      <p className="font-sketch font-bold text-lg text-[#1a1a1a]">
                        {entry.medicine}
                      </p>
                      {entry.voice && (
                        <p className="font-sketch text-sm text-[#83311A]/50 mt-0.5 italic">
                          {entry.voice}
                        </p>
                      )}
                    </div>

                    {/* Delete on hover */}
                    <button
                      onClick={() => {
                        const next = entries.filter(e => e.id !== entry.id);
                        setEntries(next);
                        if (next.length === 0) setStage(1);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 flex-shrink-0 mt-1"
                      aria-label={`Delete ${entry.medicine}`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                );
              })}
          </div>

          {/* + Add another */}
          <div className="flex justify-center mt-5">
            <button
              onClick={handleAdd}
              className="w-12 h-12 flex items-center justify-center text-[#1a1a1a] hover:text-[#D94F2B] hover:scale-110 transition-all"
              style={{ border: "2px solid #1a1a1a", borderRadius: "4px", filter: "url(#rough)" }}
              aria-label="Add another reminder"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
