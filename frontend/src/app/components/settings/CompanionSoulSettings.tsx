import { useState, useRef } from "react";
import type { UserProfile } from "../../lib/api";

type Personality = "warm" | "formal" | "playful";
type Language = "english" | "hindi";

const TONES = [
  { id: "warm" as Personality, title: "Warm & Casual", desc: "Friendly, relaxed, conversational", icon: "☀️" },
  { id: "formal" as Personality, title: "Formal & Respectful", desc: "Polite, structured, traditional tone", icon: "🎩" },
  { id: "playful" as Personality, title: "Playful & Humorous", desc: "Light, cheerful, slightly humorous", icon: "🎈" },
];

const SUGGESTED_INTERESTS = ["Green Tea", "Cricket", "Morning Walk", "Bhajan", "Gardening", "Cooking", "News", "Yoga", "Chess", "Music"];

type Props = {
  profile: UserProfile | null;
  onSave: (tone: Personality, language: Language, interests: string[]) => Promise<void>;
};

export function CompanionSoulSettings({ profile, onSave }: Props) {
  const [tone, setTone] = useState<Personality | null>(profile?.companionTone ?? null);
  const [language, setLanguage] = useState<Language>(profile?.companionLanguage ?? "english");
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [input, setInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle"|"success"|"error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !interests.includes(t) && interests.length < 20) {
      setInterests([...interests, t]);
      setInput("");
      setStatus("idle");
      inputRef.current?.focus();
    }
  };

  const removeTag = (tag: string) => {
    setInterests(interests.filter(i => i !== tag));
    setStatus("idle");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && interests.length > 0) {
      removeTag(interests[interests.length - 1]);
    }
  };

  const handleSave = async () => {
    if (!tone) return;
    setIsSaving(true); setStatus("idle");
    try { await onSave(tone, language, interests); setStatus("success"); setTimeout(()=>setStatus("idle"),3000); }
    catch { setStatus("error"); }
    finally { setIsSaving(false); }
  };

  const unusedSuggestions = SUGGESTED_INTERESTS.filter(s => !interests.includes(s));

  return (
    <div className="space-y-10 animate-fade-in pb-32">
      {/* Header and User Context */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white sketch-box text-[#D94F2B] flex items-center justify-center text-2xl shadow-sm">✨</div>
          <div>
            <h3 className="text-2xl font-sketch font-bold text-[#D94F2B] relative -top-1.5">Companion Soul</h3>
            <p className="text-sm text-[#83311A]/60 font-sketch font-medium uppercase tracking-wider">Configure personality, language, and memories.</p>
          </div>
        </div>
        {profile && (
          <div className="bg-white sketch-box p-6 text-[#D94F2B] sketch-shadow flex items-center gap-5" style={{ transform: 'rotate(-0.5deg)' }}>
            <div className="w-14 h-14 bg-[#D94F2B]/10 sketch-avatar flex items-center justify-center text-[#D94F2B] font-sketch font-bold text-2xl">
              {profile.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-xl font-sketch font-bold text-[#D94F2B] capitalize">{profile.name || "User"}</p>
              <p className="text-sm text-[#83311A]/50 font-sketch font-bold uppercase tracking-widest">{profile.role || "Caregiver"}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="space-y-10">
          {/* Language Toggle */}
          <div className="bg-white sketch-box p-6 text-[#D94F2B]" style={{ transform: 'rotate(0.3deg)' }}>
            <div className="relative mb-6">
              <label className="inline-block text-sm font-sketch font-bold uppercase tracking-widest text-[#83311A]/70">Language Settings</label>
              <div className="absolute -bottom-1 left-0 w-20 sketch-underline border-[#D94F2B]"></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => { setLanguage("english"); setStatus("idle"); }}
                className={`flex flex-col items-center justify-center gap-4 p-6 transition-all font-sketch ${language==="english" ? "bg-[#D94F2B] text-white sketch-box shadow-md scale-105" : "bg-transparent text-[#83311A] sketch-box hover:bg-[#D94F2B]/5"}`}
                aria-label="Select English"
              >
                <span className="text-5xl">🇬🇧</span>
                <span className="font-bold text-lg">GB English</span>
              </button>
              <button
                onClick={() => { setLanguage("hindi"); setStatus("idle"); }}
                className={`flex flex-col items-center justify-center gap-4 p-6 transition-all font-sketch ${language==="hindi" ? "bg-[#D94F2B] text-white sketch-box shadow-md scale-105" : "bg-transparent text-[#83311A] sketch-box hover:bg-[#D94F2B]/5"}`}
                aria-label="Select Hindi"
              >
                <span className="text-5xl">🇮🇳</span>
                <span className="font-bold text-lg">IN Hindi</span>
              </button>
            </div>
          </div>

          {/* Tone Card Selector */}
          <div className="bg-white sketch-box p-6 text-[#D94F2B]" style={{ transform: 'rotate(-0.2deg)' }}>
            <div className="relative mb-6">
              <label className="inline-block text-sm font-sketch font-bold uppercase tracking-widest text-[#83311A]/70">Companion Tone</label>
              <div className="absolute -bottom-1 left-0 w-20 sketch-underline border-[#D94F2B]"></div>
            </div>
            
            <div className="space-y-6">
              {tone && (
                <div className="w-full text-left p-6 bg-[#D94F2B] text-white sketch-box shadow-md" style={{ transform: 'rotate(0.5deg)' }}>
                  <div className="flex items-center gap-5">
                    <div className="text-4xl bg-white w-16 h-16 sketch-avatar flex items-center justify-center flex-shrink-0">{TONES.find(t => t.id === tone)?.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-sketch font-bold mb-1">
                        {TONES.find(t => t.id === tone)?.title} <span className="text-xs font-sketch font-bold px-3 py-1 bg-white text-[#D94F2B] sketch-dot ml-2">Active</span>
                      </h4>
                      <p className="text-sm font-sketch opacity-90">{TONES.find(t => t.id === tone)?.desc}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {TONES.filter(t => t.id !== tone).map((t, idx) => (
                  <button key={t.id} onClick={() => { setTone(t.id); setStatus("idle"); }}
                    className="w-full text-left p-4 bg-transparent text-[#D94F2B] sketch-box hover:bg-[#D94F2B]/5 transition-all"
                    style={{ transform: `rotate(${idx % 2 === 0 ? -0.5 : 0.5}deg)` }}
                    aria-label={`Select ${t.title} tone`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl bg-[#D94F2B]/10 w-12 h-12 sketch-avatar flex items-center justify-center flex-shrink-0">{t.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-sketch font-bold text-[#D94F2B]">{t.title}</h4>
                        <p className="text-xs font-sketch text-[#83311A]/60 truncate">{t.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Memory & Interests */}
          <div className="bg-white sketch-box p-6 text-[#D94F2B] h-full flex flex-col" style={{ transform: 'rotate(0.2deg)' }}>
            <div className="relative mb-6">
              <label className="inline-block text-sm font-sketch font-bold uppercase tracking-widest text-[#83311A]/70">Memory & Interests</label>
              <div className="absolute -bottom-1 left-0 w-24 sketch-underline border-[#D94F2B]"></div>
            </div>
            <p className="text-sm font-sketch text-[#83311A]/60 mb-6 italic">Help the companion know your parent better. These tags shape the AI's contextual understanding.</p>
            
            <div className="flex flex-wrap gap-3 p-6 bg-[#D94F2B]/5 sketch-box text-[#D94F2B] min-h-[150px] mb-6">
              {interests.map(tag => (
                <span key={tag} className="inline-flex items-center gap-2 px-4 py-2 bg-white sketch-box text-[#D94F2B] text-base font-sketch font-bold">
                  {tag}
                  <button onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`} className="text-[#D94F2B] hover:text-red-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={interests.length === 0 ? "Type an interest..." : "Add more..."}
                aria-label="Add interest tag"
                className="flex-1 min-w-[150px] px-2 py-2 text-xl font-sketch font-bold text-[#D94F2B] placeholder-[#83311A]/40 focus:outline-none bg-transparent"
              />
            </div>
            
            {/* Quick-Add Suggestions */}
            {unusedSuggestions.length > 0 && (
              <div className="mt-auto pt-6">
                <label className="block text-sm font-sketch font-bold uppercase tracking-widest text-[#83311A]/50 mb-4">Quick Add</label>
                <div className="flex flex-wrap gap-3">
                  {unusedSuggestions.slice(0, 10).map(s => (
                    <button key={s} onClick={() => addTag(s)}
                      className="px-4 py-2 bg-transparent sketch-box border-dashed border-[#D94F2B]/30 text-base font-sketch font-bold text-[#83311A]/60 hover:border-[#D94F2B] hover:text-[#D94F2B] transition-all">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}