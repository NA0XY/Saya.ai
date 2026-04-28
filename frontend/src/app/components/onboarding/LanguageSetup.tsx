import { useState } from "react";

type Language = "english" | "hindi";

const languages = [
  {
    id: "english" as Language,
    title: "English",
    icon: "🇬🇧"
  },
  {
    id: "hindi" as Language,
    title: "Hindi",
    icon: "🇮🇳"
  }
];

export function LanguageSetup({
  onFinish,
  initialLanguage
}: {
  onFinish: (language: Language) => void;
  initialLanguage: Language | null;
}) {
  const [selected, setSelected] = useState<Language | null>(initialLanguage);

  const handleFinish = () => {
    if (selected) {
      onFinish(selected);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight leading-tight uppercase">
          WHICH LANGUAGE SHOULD IT USE?
        </h1>

        <p className="text-lg text-gray-700 max-w-lg">
          The companion will speak and respond in this language.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        {languages.map((language) => (
          <button
            key={language.id}
            onClick={() => setSelected(language.id)}
            className={`p-8 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-1 ${
              selected === language.id
                ? "border-[#E85D2A] bg-[#E85D2A]/5 shadow-md"
                : "border-gray-300 bg-white hover:border-[#E85D2A]/50"
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-5xl">{language.icon}</div>
              <h3 className="text-2xl font-bold">{language.title}</h3>
              {selected === language.id && (
                <div className="w-6 h-6 bg-[#E85D2A] rounded-full flex items-center justify-center mt-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 pt-2">
        You can change this later.
      </p>

      <button
        onClick={handleFinish}
        disabled={!selected}
        className="mt-8 bg-[#E85D2A] text-white px-10 py-4 rounded-xl shadow-lg hover:bg-[#d64d1f] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
      >
        Finish Setup
      </button>
    </div>
  );
}
