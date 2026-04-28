import { useState } from "react";

type Personality = "warm" | "formal" | "playful";

const personalities = [
  {
    id: "warm" as Personality,
    title: "Warm & Casual",
    description: "Friendly, relaxed, conversational",
    icon: "☀️"
  },
  {
    id: "formal" as Personality,
    title: "Formal & Respectful",
    description: "Polite, structured, traditional tone",
    icon: "🎩"
  },
  {
    id: "playful" as Personality,
    title: "Playful & Humorous",
    description: "Light, cheerful, slightly humorous",
    icon: "🎈"
  }
];

export function PersonalityConfig({
  onNext,
  initialPersonality
}: {
  onNext: (personality: Personality) => void;
  initialPersonality: Personality | null;
}) {
  const [selected, setSelected] = useState<Personality | null>(initialPersonality);

  const handleContinue = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight leading-tight uppercase">
          HOW SHOULD THE COMPANION SPEAK?
        </h1>

        <p className="text-lg text-gray-700 max-w-lg">
          Choose a tone that feels natural for your parent.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        {personalities.map((personality) => (
          <button
            key={personality.id}
            onClick={() => setSelected(personality.id)}
            className={`w-full text-left p-6 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-1 ${
              selected === personality.id
                ? "border-[#E85D2A] bg-[#E85D2A]/5 shadow-md"
                : "border-gray-300 bg-white hover:border-[#E85D2A]/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{personality.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{personality.title}</h3>
                <p className="text-gray-600">{personality.description}</p>
              </div>
              {selected === personality.id && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-[#E85D2A] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}

        <button
          onClick={handleContinue}
          disabled={!selected}
          className="mt-8 bg-[#E9C46A] px-8 py-4 rounded-xl border border-[#d4b25f] shadow-sm hover:bg-[#dbb860] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none font-semibold"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
