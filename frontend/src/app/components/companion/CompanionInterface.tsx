import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Settings, X } from "lucide-react";
import { DottedBackground } from "../DottedBackground";
import { CompanionAvatar } from "./CompanionAvatar";
import { VoiceButton } from "./VoiceButton";
import { QuickActions } from "./QuickActions";
import { api, type CompanionHistoryMessage, type CompanionChatResponse, type NewsItem, type PatientMemory } from "../../lib/api";
import { EXPRESSION_MAP, type MoodType } from "./expressionMap";
import { NewsTicker } from "./NewsTicker";
import { ChatHistory, type ChatMessage, type SentimentTag } from "./ChatHistory";

type VoiceState = "idle" | "listening" | "processing";
type InputLanguage = "en" | "hi";
type TonePreference = "warm" | "formal" | "playful";

const LANGUAGE_STORAGE_KEY = "saya_language_preference";
const VOICE_SPEED_STORAGE_KEY = "saya_voice_speed";
const NEWS_CATEGORIES_STORAGE_KEY = "saya_news_categories";
const PATIENT_STORAGE_KEY = "saya_patient_id";
const TONE_STORAGE_KEY = "saya_companion_tone";

function sentimentToMood(sentiment: SentimentTag, voiceState: VoiceState): MoodType {
  if (voiceState === "listening") return "listening";
  if (voiceState === "processing") return "thinking";
  switch (sentiment) {
    case "joy":
      return "happy";
    case "sadness":
      return "sad";
    case "anxiety":
      return "anxious";
    default:
      return "neutral";
  }
}

function getLocalTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function buildPersonalisedGreeting(memories: PatientMemory[], news: NewsItem[]): string {
  if (news.length > 0) {
    const topHeadline = news[0];
    return `${getLocalTimeGreeting()}! I saw that ${topHeadline.headline.toLowerCase().replace(/\.$/, "")}. Would you like to know more?`;
  }

  const favouriteDrink = memories.find((memory) => memory.memory_key === "favourite_drink");
  if (favouriteDrink?.memory_value) {
    return `Namaste! Would you like some ${favouriteDrink.memory_value} today?`;
  }

  const moodMemory = memories.find(
    (memory) => memory.memory_key === "last_mood" || memory.memory_key.includes("mood")
  );
  if (moodMemory?.memory_value) {
    return `I remember you mentioned feeling ${moodMemory.memory_value} last time. How are you doing now?`;
  }

  return "Namaste. How are you feeling today?";
}

function normalizeHistoryMessage(message: CompanionHistoryMessage): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    sentiment: (message.sentiment ?? undefined) as SentimentTag | undefined,
    timestamp: new Date(message.created_at),
  };
}

function getPatientIdFromContext(): string | null {
  if (typeof window === "undefined") return null;
  const fromQuery = new URLSearchParams(window.location.search).get("patientId");
  if (fromQuery) {
    localStorage.setItem(PATIENT_STORAGE_KEY, fromQuery);
    return fromQuery;
  }
  return localStorage.getItem(PATIENT_STORAGE_KEY);
}

export function CompanionInterface() {
  const recognitionRef = useRef<any>(null);
  const debounceRef = useRef<number | null>(null);
  const maxSpeechTimerRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef("");
  const escalationTimeoutRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isAudioPlayingRef = useRef(false);

  const [patientId, setPatientId] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [currentSentiment, setCurrentSentiment] = useState<SentimentTag>("neutral");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [greetingText, setGreetingText] = useState("Namaste. How are you feeling today?");

  const [inputLanguage, setInputLanguage] = useState<InputLanguage>(() => {
    if (typeof window === "undefined") return "en";
    const value = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return value === "hi" ? "hi" : "en";
  });
  const [settingsLanguage, setSettingsLanguage] = useState<InputLanguage>(() => {
    if (typeof window === "undefined") return "en";
    const value = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return value === "hi" ? "hi" : "en";
  });
  const [tonePreference, setTonePreference] = useState<TonePreference>(() => {
    if (typeof window === "undefined") return "warm";
    const value = localStorage.getItem(TONE_STORAGE_KEY);
    return value === "formal" || value === "playful" ? value : "warm";
  });
  const [voiceSpeed, setVoiceSpeed] = useState(() => {
    if (typeof window === "undefined") return "medium";
    const value = localStorage.getItem(VOICE_SPEED_STORAGE_KEY);
    return value === "slow" || value === "fast" ? value : "medium";
  });
  const [newsCategories, setNewsCategories] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["National", "Health"];
    try {
      const parsed = JSON.parse(localStorage.getItem(NEWS_CATEGORIES_STORAGE_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed : ["National", "Health"];
    } catch {
      return ["National", "Health"];
    }
  });

  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [memoriesError, setMemoriesError] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);

  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [memories, setMemories] = useState<PatientMemory[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showNewsPanel, setShowNewsPanel] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [escalationBannerVisible, setEscalationBannerVisible] = useState(false);
  const [forceSadMood, setForceSadMood] = useState(false);
  const [isReplySpeaking, setIsReplySpeaking] = useState(false);

  const effectiveMood = useMemo<MoodType>(() => {
    if (forceSadMood) return "sad";
    return sentimentToMood(currentSentiment, voiceState);
  }, [currentSentiment, forceSadMood, voiceState]);

  const clearSpeechTimers = () => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (maxSpeechTimerRef.current !== null) {
      window.clearTimeout(maxSpeechTimerRef.current);
      maxSpeechTimerRef.current = null;
    }
  };

  const fallbackSpeakInBrowser = (text: string, sentiment: SentimentTag) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = inputLanguage === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = voiceSpeed === "slow" ? 0.9 : voiceSpeed === "fast" ? 1.1 : 1.0;
    utterance.pitch = sentiment === "joy" ? 1.15 : sentiment === "sadness" ? 0.9 : 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const playNextQueuedAudio = () => {
    const nextUrl = audioQueueRef.current.shift();
    if (!nextUrl) {
      isAudioPlayingRef.current = false;
      setIsReplySpeaking(false);
      return;
    }

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
    }
    const player = audioElementRef.current;
    isAudioPlayingRef.current = true;
    setIsReplySpeaking(true);
    player.src = nextUrl;
    player.playbackRate = voiceSpeed === "slow" ? 0.9 : voiceSpeed === "fast" ? 1.1 : 1.0;
    void player.play().catch(() => {
      URL.revokeObjectURL(nextUrl);
      playNextQueuedAudio();
    });

    player.onended = () => {
      URL.revokeObjectURL(nextUrl);
      playNextQueuedAudio();
    };
    player.onerror = () => {
      URL.revokeObjectURL(nextUrl);
      playNextQueuedAudio();
    };
  };

  const playAssistantSpeech = async (text: string, sentiment: SentimentTag, targetPatientId?: string) => {
    const effectivePatientId = targetPatientId ?? patientId;
    if (!effectivePatientId) return;
    try {
      const response = await api.streamCompanionSpeech(effectivePatientId, {
        text,
        language: inputLanguage,
        sentiment,
        tone: tonePreference,
        voiceSpeed,
      });
      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "audio/mpeg";

      if (!response.body) {
        throw new Error("No audio stream returned");
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      const audioBlob = new Blob(chunks, { type: contentType.includes("wav") ? "audio/wav" : "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioQueueRef.current.push(audioUrl);
      if (!isAudioPlayingRef.current) {
        playNextQueuedAudio();
      }
    } catch {
      fallbackSpeakInBrowser(text, sentiment);
    }
  };

  const loadMemories = async (currentPatientId: string) => {
    setLoadingMemories(true);
    try {
      const data = await api.getCompanionMemories(currentPatientId);
      setMemories(data);
      setMemoriesError(null);
      return data;
    } catch (error) {
      setMemoriesError(error instanceof Error ? error.message : "Failed to load memories");
      return [];
    } finally {
      setLoadingMemories(false);
    }
  };

  const loadNews = async () => {
    setLoadingNews(true);
    try {
      const data = await api.getCompanionNews();
      setNews(data);
      setNewsError(null);
      return data;
    } catch (error) {
      setNewsError(error instanceof Error ? error.message : "Failed to load news");
      return [];
    } finally {
      setLoadingNews(false);
    }
  };

  const loadHistory = async (currentPatientId: string) => {
    setLoadingHistory(true);
    try {
      const data = await api.getCompanionHistory(currentPatientId);
      setMessages(data.map(normalizeHistoryMessage));
      setHistoryError(null);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "Failed to load conversation history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadPreferences = async (currentPatientId: string) => {
    try {
      const preferences = await api.getCompanionPreferences(currentPatientId);
      setTonePreference(preferences.tone);
      setSettingsLanguage(preferences.language);
      setInputLanguage(preferences.language);
      localStorage.setItem(TONE_STORAGE_KEY, preferences.tone);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, preferences.language);
    } catch {
      // Keep existing local defaults when backend preference loading fails.
    }
  };

  const handleResponse = async (userInput: string) => {
    let activePatientId = patientId;
    if (!activePatientId) {
      try {
        const context = await api.getCompanionPatientContext();
        if (context.patient_id) {
          localStorage.setItem(PATIENT_STORAGE_KEY, context.patient_id);
          setPatientId(context.patient_id);
          activePatientId = context.patient_id;
        }
      } catch {
        // ignore and show the onboarding hint below.
      }
    }
    if (!activePatientId) {
      setVoiceState("idle");
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role: "user",
      content: userInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setApiError(null);

    try {
      const result: CompanionChatResponse = await api.companionChat({
        patient_id: activePatientId,
        message: userInput,
        language: inputLanguage,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role: "assistant",
        content: result.reply,
        sentiment: result.sentiment,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentSentiment(result.sentiment);
      void playAssistantSpeech(result.reply, result.sentiment, activePatientId);

      if (result.memories_updated) {
        await loadMemories(activePatientId);
      }

      if (result.escalated) {
        setEscalationBannerVisible(true);
        setForceSadMood(true);
        if (escalationTimeoutRef.current !== null) window.clearTimeout(escalationTimeoutRef.current);
        escalationTimeoutRef.current = window.setTimeout(() => {
          setEscalationBannerVisible(false);
          setForceSadMood(false);
        }, 10000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Companion backend unavailable";
      setApiError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          content: "I had trouble responding right now, but I am still here with you. Please try again.",
          sentiment: "neutral",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setVoiceState("idle");
    }
  };

  useEffect(() => {
    Object.values(EXPRESSION_MAP).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const resolvedPatientId = getPatientIdFromContext();
    if (resolvedPatientId) {
      setPatientId(resolvedPatientId);
      return;
    }

    void (async () => {
      try {
        const context = await api.getCompanionPatientContext();
        if (context.patient_id) {
          localStorage.setItem(PATIENT_STORAGE_KEY, context.patient_id);
          setPatientId(context.patient_id);
          return;
        }
      } catch {
        // Keep silent here; auth/onboarding flow will surface its own error states.
      }
      setLoadingHistory(false);
      setLoadingMemories(false);
      setLoadingNews(false);
    })();
  }, []);

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;

    void (async () => {
      const [memoryList, newsList] = await Promise.all([loadMemories(patientId), loadNews(), loadPreferences(patientId)]);
      if (!cancelled) setGreetingText(buildPersonalisedGreeting(memoryList, newsList));
      await loadHistory(patientId);
    })();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setPermissionError("Voice not supported on this browser. Please type instead.");
      setShowTextInput(true);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.maxAlternatives = 3;
    recognitionInstance.lang = inputLanguage === "hi" ? "hi-IN" : "en-US";

    recognitionInstance.onstart = () => {
      setVoiceState("listening");
      setInterimTranscript("");
      setLiveTranscript("");
      finalTranscriptRef.current = "";
      setPermissionError(null);
    };

    recognitionInstance.onresult = (event: any) => {
      let interim = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalTranscript += result[0].transcript;
        else interim += result[0].transcript;
      }

      setInterimTranscript(interim.trim());
      if (finalTranscript.trim()) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalTranscript}`.trim();
        setInterimTranscript("");
      }
      setLiveTranscript(`${finalTranscriptRef.current} ${interim}`.trim());
    };

    recognitionInstance.onend = () => {
      if (maxSpeechTimerRef.current !== null) {
        window.clearTimeout(maxSpeechTimerRef.current);
        maxSpeechTimerRef.current = null;
      }

      const finalTranscript = finalTranscriptRef.current.trim();
      if (!finalTranscript) {
        setLiveTranscript("");
        setVoiceState("idle");
        return;
      }

      setVoiceState("processing");
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        setLiveTranscript("");
        finalTranscriptRef.current = "";
        void handleResponse(finalTranscript);
      }, 300);
    };

    recognitionInstance.onerror = (event: any) => {
      clearSpeechTimers();
      setVoiceState("idle");
      if (event.error === "not-allowed") {
        setPermissionError("Please allow microphone access to talk to your companion.");
        setShowTextInput(true);
      } else if (event.error === "no-speech") {
        const isEdge = typeof navigator !== "undefined" && navigator.userAgent.includes("Edg/");
        setPermissionError(
          isEdge
            ? "I couldn't capture voice here. Edge speech recognition can be unreliable; please try typed input or Chrome."
            : "I didn't hear anything. Please try again."
        );
        setShowTextInput(true);
      } else {
        setPermissionError("Voice not available. You can type instead.");
        setShowTextInput(true);
      }
    };

    recognitionRef.current = recognitionInstance;

    return () => {
      clearSpeechTimers();
      recognitionInstance.onstart = null;
      recognitionInstance.onresult = null;
      recognitionInstance.onend = null;
      recognitionInstance.onerror = null;
      recognitionInstance.stop();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, inputLanguage);
    if (recognitionRef.current) {
      recognitionRef.current.lang = inputLanguage === "hi" ? "hi-IN" : "en-US";
    }
  }, [inputLanguage]);

  useEffect(() => {
    return () => {
      if (escalationTimeoutRef.current !== null) window.clearTimeout(escalationTimeoutRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
        audioElementRef.current = null;
      }
      audioQueueRef.current.forEach((url) => URL.revokeObjectURL(url));
      audioQueueRef.current = [];
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleVoiceClick = () => {
    if (voiceState !== "idle" || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      maxSpeechTimerRef.current = window.setTimeout(() => {
        recognitionRef.current?.stop();
      }, 45000);
    } catch {
      setPermissionError("Voice not available. You can type instead.");
      setShowTextInput(true);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    setVoiceState("processing");
    const content = textInput.trim();
    setTextInput("");
    void handleResponse(content);
  };

  const handleCallFamily = () => {
    void handleResponse("Please help me contact my family.");
  };

  const handleHelp = () => {
    void handleResponse("I need help right now.");
  };

  const handleRemindLater = () => {
    void handleResponse("Please remind me later.");
  };

  const handleNewsCardClick = (headline: string) => {
    setShowNewsPanel(false);
    void handleResponse(`Tell me more about: ${headline}`);
  };

  const toggleNewsCategory = (category: string) => {
    setNewsCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const savePreferences = async () => {
    if (!patientId) {
      return;
    }

    setSavingPreferences(true);
    setApiError(null);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, settingsLanguage);
      localStorage.setItem(TONE_STORAGE_KEY, tonePreference);
      localStorage.setItem(VOICE_SPEED_STORAGE_KEY, voiceSpeed);
      localStorage.setItem(NEWS_CATEGORIES_STORAGE_KEY, JSON.stringify(newsCategories));
      setInputLanguage(settingsLanguage);
      await api.updateCompanionPreferences(patientId, { tone: tonePreference, language: settingsLanguage });
      setSettingsOpen(false);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Failed to save preferences");
    } finally {
      setSavingPreferences(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1EA] relative overflow-hidden flex flex-col">
      <DottedBackground />
      <NewsTicker news={news} loading={loadingNews} error={newsError} />

      {escalationBannerVisible && (
        <div className="relative z-30 mx-4 mt-4 bg-[#FFF3CD] border border-[#FFD700] rounded-xl px-6 py-3 text-sm font-semibold text-[#7D6608] flex items-center gap-3 transition-all duration-300">
          <span>💛</span>
          <span>I&apos;ve let your family know you might need some extra love today. They&apos;ll reach out soon.</span>
          <button
            type="button"
            aria-label="Dismiss escalation message"
            onClick={() => {
              setEscalationBannerVisible(false);
              setForceSadMood(false);
            }}
            className="ml-auto text-lg"
          >
            ×
          </button>
        </div>
      )}

      <div className="absolute top-8 left-8 md:top-12 md:left-12 z-20 flex flex-col items-start gap-4">
        <Link to="/" className="text-2xl md:text-3xl font-bold tracking-widest text-[#2A2B3D]">
          SAYA.AI
        </Link>
        <button
          type="button"
          aria-label="Open companion settings"
          onClick={() => setSettingsOpen(true)}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:border-[#E85D2A] hover:shadow-md transition-all duration-300"
        >
          <Settings className="w-6 h-6 text-[#83311A]" />
        </button>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-start justify-center px-6 md:px-12 py-16 lg:py-20 gap-10 lg:gap-16">
          <div className="w-full lg:flex-1 flex items-center justify-center mt-14 lg:mt-0">
            <div className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] flex items-center justify-center">
              <CompanionAvatar mood={effectiveMood} voiceState={voiceState} />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col items-center text-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-[3rem] font-bold text-[#E85D2A] leading-[1.15] heading-display tracking-tight drop-shadow-sm uppercase">
                {greetingText}
              </h1>
              <p className="text-lg md:text-xl font-semibold text-[#7A6A63] mt-2">
                &quot;I&apos;m here to listen and support you.&quot;
              </p>
            </div>

            <div className="w-full flex justify-center py-2 relative">
              {!showTextInput ? (
                <VoiceButton
                  state={voiceState}
                  language={inputLanguage}
                  onLanguageChange={(language) => {
                    setInputLanguage(language);
                    setSettingsLanguage(language);
                  }}
                  onClick={handleVoiceClick}
                />
              ) : (
                <div className="w-full max-w-md flex flex-col gap-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(event) => setTextInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleTextSubmit();
                      }}
                      placeholder="Type your message..."
                      className="flex-1 px-6 py-4 rounded-2xl border-2 border-white focus:border-[#E85D2A] focus:outline-none text-lg font-medium bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300"
                    />
                    <button
                      type="button"
                      aria-label="Send typed message"
                      onClick={handleTextSubmit}
                      disabled={!textInput.trim()}
                      className="bg-[#E85D2A] text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[#d64d1f] hover:-translate-y-1 hover:shadow-lg disabled:opacity-40 disabled:hover:translate-y-0"
                    >
                      Send
                    </button>
                  </div>
                  {recognitionRef.current && (
                    <button
                      type="button"
                      aria-label="Switch back to voice input"
                      onClick={() => {
                        setShowTextInput(false);
                        setPermissionError(null);
                      }}
                      className="text-sm text-[#7A6A63] hover:text-[#E85D2A] transition-all duration-300 font-semibold uppercase tracking-wider"
                    >
                      Back to voice
                    </button>
                  )}
                </div>
              )}
            </div>

            {voiceState === "listening" && (liveTranscript || interimTranscript) && (
              <div className="w-full max-w-xl">
                <div className="mx-auto rounded-2xl border border-[#E85D2A]/20 bg-white px-4 py-3 text-sm lg:text-base text-[#7A6A63] italic animate-pulse transition-all duration-300">
                  {liveTranscript || interimTranscript}
                </div>
              </div>
            )}
            {isReplySpeaking && (
              <div className="rounded-full border border-[#E85D2A]/30 bg-white px-4 py-2 text-sm font-bold tracking-wider uppercase text-[#83311A] animate-pulse transition-all duration-300">
                Speaking...
              </div>
            )}

            <div className="w-full max-w-3xl flex flex-col gap-4">
              {permissionError && (
                <div className="bg-orange-50 border-2 border-[#E85D2A] rounded-2xl px-6 py-4 shadow-sm">
                  <p className="text-sm lg:text-base text-center text-[#2A2B3D] font-semibold">{permissionError}</p>
                </div>
              )}
              {apiError && (
                <div className="bg-orange-50 border-2 border-[#E85D2A]/40 rounded-2xl px-6 py-4 shadow-sm">
                  <p className="text-sm text-center text-[#83311A] font-semibold">{apiError}</p>
                </div>
              )}
              {(loadingHistory || Boolean(historyError) || messages.length > 0) && (
                <ChatHistory messages={messages} loading={loadingHistory} error={historyError} />
              )}
            </div>

            <div className="w-full mt-2">
              <QuickActions
                onCallFamily={handleCallFamily}
                onHelp={handleHelp}
                onRemindLater={handleRemindLater}
                onShowNews={() => setShowNewsPanel(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed z-40 top-0 right-0 h-full w-full sm:w-[92%] lg:w-[460px] bg-white border-l border-[#E85D2A]/20 shadow-xl transition-all duration-300 ${
          showNewsPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E85D2A]/15">
            <h3 className="text-lg font-bold tracking-tight uppercase text-[#2A2B3D]">Today&apos;s News</h3>
            <button
              type="button"
              aria-label="Close news panel"
              onClick={() => setShowNewsPanel(false)}
              className="rounded-full p-1 text-[#83311A] hover:bg-[#F5F1EA] transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#F5F1EA]">
            {loadingNews && (
              <>
                {[1, 2, 3].map((item) => (
                  <div key={`news-panel-loading-${item}`} className="h-28 rounded-2xl bg-gray-200 animate-pulse" />
                ))}
              </>
            )}
            {!loadingNews && news.length === 0 && (
              <div className="rounded-2xl border border-[#E85D2A]/20 bg-white px-4 py-4 text-sm font-semibold text-[#7A6A63]">
                No headlines available right now.
              </div>
            )}
            {!loadingNews &&
              news.map((item) => (
                <button
                  key={`panel-news-${item.id}`}
                  type="button"
                  aria-label={`Ask companion about ${item.headline}`}
                  onClick={() => handleNewsCardClick(item.headline)}
                  className="w-full rounded-2xl bg-white border border-[#E85D2A]/10 shadow-sm p-4 text-left hover:border-[#E85D2A]/35 transition-all duration-300"
                >
                  <h4 className="text-base lg:text-lg font-bold tracking-tight text-[#2A2B3D]">{item.headline}</h4>
                  <p className="mt-1 text-sm font-semibold text-[#7A6A63]">
                    {(item.source ?? "Unknown source").toUpperCase()} • {new Date(item.published_at ?? item.fetched_at ?? Date.now()).toLocaleString()}
                  </p>
                  <p className="mt-3 text-sm lg:text-base font-semibold text-[#2A2B3D]">
                    {item.summary ?? "Tap to ask Saya for more details on this news."}
                  </p>
                </button>
              ))}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-full sm:w-[92%] lg:w-[430px] bg-white border-r border-[#E85D2A]/20 shadow-xl transition-all duration-300 ${
          settingsOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight uppercase text-[#2A2B3D]">Companion Settings</h3>
            <button
              type="button"
              aria-label="Close settings"
              onClick={() => setSettingsOpen(false)}
              className="rounded-full p-1 text-[#83311A] hover:bg-[#F5F1EA] transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <section className="rounded-2xl border border-[#E85D2A]/15 bg-[#F5F1EA] p-4">
              <h4 className="text-sm font-bold tracking-tight uppercase text-[#2A2B3D]">Tone Preference</h4>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Warm & Casual", value: "warm" as TonePreference },
                  { label: "Formal & Respectful", value: "formal" as TonePreference },
                  { label: "Playful & Humorous", value: "playful" as TonePreference },
                ].map((tone) => (
                  <label key={`tone-${tone.value}`} className="flex items-center gap-2 text-sm font-semibold text-[#2A2B3D]">
                    <input
                      type="radio"
                      name="companion-tone"
                      value={tone.value}
                      checked={tonePreference === tone.value}
                      onChange={() => setTonePreference(tone.value)}
                      className="accent-[#E85D2A]"
                    />
                    {tone.label}
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#E85D2A]/15 bg-[#F5F1EA] p-4">
              <h4 className="text-sm font-bold tracking-tight uppercase text-[#2A2B3D]">Language Preference</h4>
              <div className="mt-3 flex items-center gap-3">
                {(["en", "hi"] as const).map((language) => (
                  <button
                    key={`settings-language-${language}`}
                    type="button"
                    aria-label={`Set language ${language === "en" ? "English" : "Hindi"}`}
                    onClick={() => setSettingsLanguage(language)}
                    className={`rounded-full px-4 py-2 text-sm font-bold tracking-wider uppercase transition-all duration-300 ${
                      settingsLanguage === language
                        ? "bg-[#E85D2A] text-white"
                        : "bg-white text-[#83311A] border border-[#E85D2A]/25"
                    }`}
                  >
                    {language === "en" ? "ENGLISH" : "हिंदी"}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#E85D2A]/15 bg-[#F5F1EA] p-4">
              <h4 className="text-sm font-bold tracking-tight uppercase text-[#2A2B3D]">Voice Speed</h4>
              <input
                type="range"
                min={0}
                max={2}
                step={1}
                aria-label="Adjust voice speed"
                value={voiceSpeed === "slow" ? 0 : voiceSpeed === "medium" ? 1 : 2}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setVoiceSpeed(value === 0 ? "slow" : value === 1 ? "medium" : "fast");
                }}
                className="mt-3 w-full accent-[#E85D2A]"
              />
              <p className="mt-2 text-sm font-semibold text-[#7A6A63] uppercase">{voiceSpeed}</p>
            </section>

            <section className="rounded-2xl border border-[#E85D2A]/15 bg-[#F5F1EA] p-4">
              <h4 className="text-sm font-bold tracking-tight uppercase text-[#2A2B3D]">News Categories</h4>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {["Sports", "Health", "National", "Entertainment"].map((category) => (
                  <label key={`news-category-${category}`} className="flex items-center gap-2 text-sm font-semibold text-[#2A2B3D]">
                    <input
                      type="checkbox"
                      checked={newsCategories.includes(category)}
                      onChange={() => toggleNewsCategory(category)}
                      className="accent-[#E85D2A]"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </section>

            <button
              type="button"
              aria-label="Save companion preferences"
              onClick={savePreferences}
              disabled={savingPreferences}
              className="w-full rounded-2xl bg-[#E85D2A] text-white py-3 text-sm font-bold tracking-wider uppercase hover:bg-[#83311A] transition-all duration-300 disabled:opacity-60"
            >
              {savingPreferences ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
