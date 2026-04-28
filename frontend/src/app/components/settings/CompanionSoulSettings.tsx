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
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header and User Context */}
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#E9C46A] to-[#f4d58d] rounded-2xl flex items-center justify-center text-2xl shadow-md">✨</div>
          <div>
            <h3 className="text-2xl font-bold text-[#83311A]">Companion Soul</h3>
            <p className="text-base text-[#83311A]/60 font-medium">Configure personality, language, and memories.</p>
          </div>
        </div>
        {profile && (
          <div className="bg-white rounded-xl p-5 border border-[#83311A]/10 shadow-sm flex items-center gap-4 mt-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E85D2A] to-[#83311A] rounded-full flex items-center justify-center text-white font-bold text-lg">
              {profile.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-base font-bold text-[#83311A] capitalize">{profile.name || "User"}</p>
              <p className="text-sm text-[#83311A]/50 font-bold uppercase tracking-wider">{profile.role || "Caregiver"}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Language Toggle */}
          <div className="bg-white rounded-2xl p-6 border border-[#83311A]/10 shadow-sm">
            <label className="block text-sm font-bold uppercase tracking-widest text-[#83311A]/70 mb-4">Language Settings</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setLanguage("english"); setStatus("idle"); }}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all ${language==="english" ? "border-[#E85D2A] bg-white shadow-md transform -translate-y-0.5" : "border-transparent bg-[#F5F1EA]/60 hover:bg-white hover:border-[#E85D2A]/30"}`}
                aria-label="Select English"
              >
                <span className="text-4xl">🇬🇧</span>
                <span className={`font-bold text-base ${language==="english" ? "text-[#E85D2A]" : "text-[#83311A]/70"}`}>GB English</span>
              </button>
              <button
                onClick={() => { setLanguage("hindi"); setStatus("idle"); }}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all ${language==="hindi" ? "border-[#E85D2A] bg-white shadow-md transform -translate-y-0.5" : "border-transparent bg-[#F5F1EA]/60 hover:bg-white hover:border-[#E85D2A]/30"}`}
                aria-label="Select Hindi"
              >
                <span className="text-4xl">🇮🇳</span>
                <span className={`font-bold text-base ${language==="hindi" ? "text-[#E85D2A]" : "text-[#83311A]/70"}`}>IN Hindi</span>
              </button>
            </div>
          </div>

          {/* Tone Card Selector */}
          <div className="bg-white rounded-2xl p-6 border border-[#83311A]/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold uppercase tracking-widest text-[#83311A]/70">Companion Tone</label>
            </div>
            
            <div className="space-y-4">
              {/* Selected Tone */}
              {tone && (
                <div className="w-full text-left p-6 rounded-xl border-2 border-[#E85D2A] bg-white shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl bg-[#F5F1EA] w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0">{TONES.find(t => t.id === tone)?.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold mb-1 text-[#E85D2A]">
                        {TONES.find(t => t.id === tone)?.title} <span className="text-xs font-semibold px-2 py-0.5 bg-[#E85D2A]/10 rounded-full ml-2">Active</span>
                      </h4>
                      <p className="text-sm text-[#83311A]/60 font-medium">{TONES.find(t => t.id === tone)?.desc}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Tones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TONES.filter(t => t.id !== tone).map(t => (
                  <button key={t.id} onClick={() => { setTone(t.id); setStatus("idle"); }}
                    className="w-full text-left p-4 rounded-xl border-2 border-transparent bg-[#F5F1EA]/60 hover:bg-white hover:border-[#E85D2A]/30 transition-all hover:shadow-sm hover:-translate-y-0.5"
                    aria-label={`Select ${t.title} tone`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">{t.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold mb-0.5 text-[#83311A]">{t.title}</h4>
                        <p className="text-xs text-[#83311A]/60 font-medium truncate">{t.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Memory & Interests */}
          <div className="bg-white rounded-2xl p-6 border border-[#83311A]/10 shadow-sm h-full flex flex-col">
            <label className="block text-sm font-bold uppercase tracking-widest text-[#83311A]/70 mb-4">Memory & Interests</label>
            <p className="text-sm text-[#83311A]/60 font-medium mb-4">Help the companion know your parent better. These tags shape the AI's contextual understanding.</p>
            
            <div className="flex flex-wrap gap-2 p-4 bg-[#F5F1EA]/40 rounded-xl border-2 border-[#83311A]/10 focus-within:border-[#E85D2A] transition-colors min-h-[100px] mb-4">
              {interests.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E85D2A]/10 text-[#83311A] rounded-lg text-sm font-bold border border-[#E85D2A]/20">
                  {tag}
                  <button onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`} className="text-[#E85D2A] hover:text-red-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={interests.length === 0 ? "Type an interest and press Enter..." : "Add more..."}
                aria-label="Add interest tag"
                className="flex-1 min-w-[150px] px-2 py-1.5 text-base font-medium text-[#83311A] placeholder-[#83311A]/40 focus:outline-none bg-transparent"
              />
            </div>
            
            {/* Quick-Add Suggestions */}
            {unusedSuggestions.length > 0 && (
              <div className="mt-auto pt-4 border-t border-[#83311A]/10">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#83311A]/50 mb-3">Quick Add</label>
                <div className="flex flex-wrap gap-2">
                  {unusedSuggestions.slice(0, 8).map(s => (
                    <button key={s} onClick={() => addTag(s)}
                      className="px-3 py-2 bg-white border border-dashed border-[#83311A]/20 rounded-lg text-sm font-medium text-[#83311A]/60 hover:border-[#E85D2A] hover:text-[#E85D2A] hover:bg-[#E85D2A]/5 transition-all">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 lg:left-80 right-0 bg-white/90 backdrop-blur-md border-t border-[#83311A]/10 p-6 flex items-center justify-between z-10">
        <div className="text-base font-medium">
          {status==="success" && <span className="text-green-600 flex items-center gap-2 font-bold"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>Companion Soul Updated</span>}
          {status==="error" && <span className="text-red-500 font-bold">Update failed</span>}
        </div>
        <button onClick={handleSave} disabled={!tone || isSaving}
          className="px-8 py-4 bg-[#E85D2A] text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#83311A] transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-0.5">
          {isSaving ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</span> : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
