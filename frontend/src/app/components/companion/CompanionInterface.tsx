import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Settings, X } from "lucide-react";
import { DottedBackground } from "../DottedBackground";
import { CompanionAvatar } from "./CompanionAvatar";
import { VoiceButton } from "./VoiceButton";
import {
  api,
  type CompanionHistoryMessage,
  type CompanionChatResponse,
  type CompanionStreamEvent,
  type NewsItem,
  type PatientMemory
} from "../../lib/api";
import { EXPRESSION_MAP, type MoodType } from "./expressionMap";
import { NewsTicker } from "./NewsTicker";
import { ChatHistory, type ChatMessage, type SentimentTag } from "./ChatHistory";

type VoiceState =
  | "idle"
  | "listening"
  | "finalizing"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "auto_relisten";
type TonePreference = "warm" | "formal" | "playful";
type LatencyMetrics = {
  capture_ms?: number;
  stt_ms?: number;
  chat_first_token_ms?: number;
  chat_total_ms?: number;
  tts_first_audio_ms?: number;
  tts_total_ms?: number;
};
const ENGLISH_ONLY_FALLBACK_REPLY =
  "I am here with you. I will continue in English so I can support you clearly. How are you feeling right now?";

const LANGUAGE_STORAGE_KEY = "saya_language_preference";
const VOICE_SPEED_STORAGE_KEY = "saya_voice_speed";
const NEWS_CATEGORIES_STORAGE_KEY = "saya_news_categories";
const PATIENT_STORAGE_KEY = "saya_patient_id";
const TONE_STORAGE_KEY = "saya_companion_tone";
const MIN_ACCEPTABLE_TRANSCRIPT_SCORE = 0.58;
const MIN_AUDIO_BLOB_BYTES = 8 * 1024;
const VOICE_PIPELINE_V2_ENABLED = (import.meta.env.VITE_VOICE_PIPELINE_V2 ?? "true") !== "false";

function sentimentToMood(sentiment: SentimentTag, voiceState: VoiceState): MoodType {
  if (voiceState === "listening" || voiceState === "auto_relisten") return "listening";
  if (voiceState === "finalizing" || voiceState === "transcribing" || voiceState === "thinking") return "thinking";
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
    content:
      message.role === "assistant"
        ? stripControlTags(message.content)
        : message.content,
    sentiment: (message.sentiment ?? undefined) as SentimentTag | undefined,
    timestamp: new Date(message.created_at),
  };
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeTranscriptText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/([,.!?])\1+/g, "$1")
    .replace(/\b(\w+)(\s+\1\b){2,}/gi, "$1")
    .trim();
}

function hasHallucinationPattern(value: string): boolean {
  const lower = value.toLowerCase();
  const suspiciousSnippets = [
    "thanks for watching",
    "subscribe",
    "subtitles by",
    "amara.org",
    "captions by",
  ];
  if (suspiciousSnippets.some((snippet) => lower.includes(snippet))) return true;
  return /\b(\w+)\s+\1\s+\1\b/i.test(value);
}

function transcriptQualityScore(transcript: string, listenDurationMs: number, audioBytes = 0): number {
  const words = countWords(transcript);
  if (!words) return 0;

  const normalized = normalizeTranscriptText(transcript);
  const lowerWords = normalized.toLowerCase().split(/\s+/).filter(Boolean);
  const fillerOnly = words < 3 && lowerWords.every((word) => ["uh", "um", "hmm", "ah", "er"].includes(word));
  const abruptCutoff = /\b(?:an|and|the|to|for|with|of)\s*$/.test(normalized.toLowerCase()) || /[bcdfghjklmnpqrstvwxyz]$/i.test(normalized) && !/[.?!]$/.test(normalized);

  let score = 0.5;
  if (words >= 2) score += 0.12;
  if (words >= 5) score += 0.08;
  if (/[,.!?]/.test(normalized)) score += 0.06;
  if (listenDurationMs > 6000 && words <= 2) score -= 0.2;
  if (listenDurationMs < 1800 && words > 16) score -= 0.22;
  if (audioBytes > 0 && audioBytes < 9000 && words > 9) score -= 0.22;
  if (audioBytes > 0 && audioBytes > 60000 && words <= 2) score -= 0.2;
  if (hasHallucinationPattern(normalized)) score -= 0.35;
  if (fillerOnly) score -= 0.28;
  if (abruptCutoff) score -= 0.12;

  return Math.max(0, Math.min(1, Number(score.toFixed(3))));
}

type TranscriptCandidate = {
  transcript: string;
  source: "browser" | "server";
  qualityScore: number;
};

function pickFinalTranscript(
  browserTranscript: string,
  sttCandidate: { transcript: string; qualityScore?: number },
  listenDurationMs: number,
  audioBytes = 0
): TranscriptCandidate | null {
  const browser = normalizeTranscriptText(browserTranscript);
  const stt = normalizeTranscriptText(sttCandidate.transcript);
  const serverScore =
    typeof sttCandidate.qualityScore === "number"
      ? sttCandidate.qualityScore
      : transcriptQualityScore(stt, listenDurationMs, audioBytes);
  const browserScore = transcriptQualityScore(browser, listenDurationMs, audioBytes);

  if (stt && serverScore >= MIN_ACCEPTABLE_TRANSCRIPT_SCORE) {
    return { transcript: stt, source: "server", qualityScore: serverScore };
  }
  if (browser && browserScore >= MIN_ACCEPTABLE_TRANSCRIPT_SCORE) {
    return { transcript: browser, source: "browser", qualityScore: browserScore };
  }

  return null;
}

function pickRelaxedFallbackTranscript(
  browserTranscript: string,
  sttCandidate: { transcript: string; qualityScore?: number },
  listenDurationMs: number,
  audioBytes = 0
): TranscriptCandidate | null {
  const browser = normalizeTranscriptText(browserTranscript);
  const stt = normalizeTranscriptText(sttCandidate.transcript);
  const serverScore =
    typeof sttCandidate.qualityScore === "number"
      ? sttCandidate.qualityScore
      : transcriptQualityScore(stt, listenDurationMs, audioBytes);
  const browserScore = transcriptQualityScore(browser, listenDurationMs, audioBytes);

  if (!browser && !stt) return null;
  if (!stt) return { transcript: browser, source: "browser", qualityScore: browserScore };
  if (!browser) return { transcript: stt, source: "server", qualityScore: serverScore };
  return serverScore >= browserScore
    ? { transcript: stt, source: "server", qualityScore: serverScore }
    : { transcript: browser, source: "browser", qualityScore: browserScore };
}

function pickBestAlternative(result: any): string {
  const alternatives = Array.from(result ?? [])
    .map((item: any) => ({
      transcript: typeof item?.transcript === "string" ? item.transcript.trim() : "",
      confidence: typeof item?.confidence === "number" ? item.confidence : 0,
    }))
    .filter((item) => item.transcript.length > 0);

  if (alternatives.length === 0) return "";
  alternatives.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return b.transcript.length - a.transcript.length;
  });
  return alternatives[0].transcript;
}

function mergeTranscriptParts(primary: string, secondary: string): string {
  const left = primary.trim();
  const right = secondary.trim();
  if (!left) return right;
  if (!right) return left;
  if (left.includes(right)) return left;
  if (right.includes(left)) return right;

  const leftWords = left.split(/\s+/);
  const rightWords = right.split(/\s+/);
  const maxOverlap = Math.min(leftWords.length, rightWords.length);

  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    const leftTail = leftWords.slice(-overlap).join(" ").toLowerCase();
    const rightHead = rightWords.slice(0, overlap).join(" ").toLowerCase();
    if (leftTail === rightHead) {
      return `${leftWords.join(" ")} ${rightWords.slice(overlap).join(" ")}`.trim();
    }
  }

  return `${left} ${right}`.trim();
}

function stripControlTags(value: string): string {
  const stripped = value
    .replace(/\[MEMORY:[^\]]+\]/g, "")
    .replace(/\[ACTION:contact_family:[^\]]+\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return /[\u0900-\u097F]/.test(stripped) ? ENGLISH_ONLY_FALLBACK_REPLY : stripped;
}

function isGratitudeClose(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return false;

  const exactClosers = new Set([
    "thanks",
    "thank you",
    "thank you so much",
    "thanks a lot",
    "thankyou",
    "ok thank you",
    "okay thank you",
  ]);
  if (exactClosers.has(normalized)) return true;

  const words = normalized.split(" ").filter(Boolean);
  if (words.length <= 8 && (normalized.startsWith("thank you") || normalized.startsWith("thanks"))) {
    return true;
  }
  return false;
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
  const speechFallbackRef = useRef<{ text: string; sentiment: SentimentTag } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const capturedAudioRef = useRef<Blob | null>(null);
  const utteranceHandledRef = useRef(false);
  const recordingStopWaitRef = useRef<Promise<void> | null>(null);
  const autoResumeListeningRef = useRef(false);
  const voiceStateRef = useRef<VoiceState>("idle");
  const turnIdRef = useRef<string | null>(null);
  const submittedTurnIdRef = useRef<string | null>(null);
  const transcriptHintTimerRef = useRef<number | null>(null);
  const recognitionStartedAtRef = useRef(0);
  const speechActivityDetectedRef = useRef(false);
  const noSpeechRetryCountRef = useRef(0);
  const shortListenRestartCountRef = useRef(0);
  const silenceStopTimerRef = useRef<number | null>(null);
  const lastSpeechActivityAtRef = useRef(0);
  const lastInterimRef = useRef("");
  const latestLiveTranscriptRef = useRef("");
  const userStoppedListeningRef = useRef(false);
  const manualStopRequestedRef = useRef(false);

  const [patientId, setPatientId] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [currentSentiment, setCurrentSentiment] = useState<SentimentTag>("neutral");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [greetingText, setGreetingText] = useState("Namaste. How are you feeling today?");

  const inputLanguage: "en" = "en";
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
  const [heardTranscriptHint, setHeardTranscriptHint] = useState<string | null>(null);
  const [showRetryChips, setShowRetryChips] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [latencyMetrics, setLatencyMetrics] = useState<LatencyMetrics>({});
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
  const [chatExpanded, setChatExpanded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [escalationBannerVisible, setEscalationBannerVisible] = useState(false);
  const [forceSadMood, setForceSadMood] = useState(false);
  const [isCompanionHovered, setIsCompanionHovered] = useState(false);
  const [isReplySpeaking, setIsReplySpeaking] = useState(false);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  const effectiveMood = useMemo<MoodType>(() => {
    if (forceSadMood) return "sad";
    if (isCompanionHovered && (voiceState === "idle" || voiceState === "speaking")) return "happy";
    return sentimentToMood(currentSentiment, voiceState);
  }, [currentSentiment, forceSadMood, isCompanionHovered, voiceState]);

  const clearSpeechTimers = () => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (maxSpeechTimerRef.current !== null) {
      window.clearTimeout(maxSpeechTimerRef.current);
      maxSpeechTimerRef.current = null;
    }
    if (silenceStopTimerRef.current !== null) {
      window.clearTimeout(silenceStopTimerRef.current);
      silenceStopTimerRef.current = null;
    }
  };

  const stopRecordingCapture = async (): Promise<void> => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recordingStopWaitRef.current = new Promise<void>((resolve) => {
        recorder.addEventListener("stop", () => resolve(), { once: true });
      });
      recorder.stop();
      await recordingStopWaitRef.current.catch(() => undefined);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  const startRecordingCapture = async () => {
    capturedAudioRef.current = null;
    audioChunksRef.current = [];
    if (typeof window === "undefined" || !(window as any).MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });
      mediaStreamRef.current = stream;
      const recorderMimeCandidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];
      const selectedMimeType = recorderMimeCandidates.find((mime) =>
        typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)
      );
      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType, audioBitsPerSecond: 128000 })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          capturedAudioRef.current = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || selectedMimeType || "audio/webm"
          });
        }
      };
      recorder.start(250);
    } catch {
      // If capture fails, browser STT can still proceed.
    }
  };

  const startVoiceCaptureSession = () => {
    if (
      !recognitionRef.current ||
      (voiceStateRef.current !== "idle" && voiceStateRef.current !== "auto_relisten")
    ) {
      return;
    }
    void (async () => {
      try {
        setPermissionError(null);
        setShowRetryChips(false);
        setHeardTranscriptHint(null);
        manualStopRequestedRef.current = false;
        userStoppedListeningRef.current = false;
        turnIdRef.current = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        submittedTurnIdRef.current = null;
        await startRecordingCapture();
        recognitionRef.current.start();
        maxSpeechTimerRef.current = window.setTimeout(() => {
          recognitionRef.current?.stop();
        }, 30000);
      } catch {
        autoResumeListeningRef.current = false;
        setPermissionError("Voice not available. You can type instead.");
        setShowTextInput(true);
      }
    })();
  };

  const fallbackSpeakInBrowser = (text: string, sentiment: SentimentTag) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setVoiceState("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = voiceSpeed === "slow" ? 0.9 : voiceSpeed === "fast" ? 1.1 : 1.0;
    utterance.pitch = sentiment === "joy" ? 1.15 : sentiment === "sadness" ? 0.9 : 1.0;
    utterance.onend = () => {
      setVoiceState("idle");
      if (autoResumeListeningRef.current && !showTextInput && recognitionRef.current) {
        setVoiceState("auto_relisten");
        window.setTimeout(() => {
          setVoiceState("idle");
          startVoiceCaptureSession();
        }, 350);
      }
    };
    utterance.onerror = () => setVoiceState("idle");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const playNextQueuedAudio = () => {
    const nextUrl = audioQueueRef.current.shift();
    if (!nextUrl) {
      isAudioPlayingRef.current = false;
      setIsReplySpeaking(false);
      setVoiceState("idle");
      if (autoResumeListeningRef.current && !showTextInput && recognitionRef.current && !userStoppedListeningRef.current) {
        setVoiceState("auto_relisten");
        window.setTimeout(() => {
          setVoiceState("idle");
          startVoiceCaptureSession();
        }, 350);
      }
      return;
    }

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
    }
    const player = audioElementRef.current;
    isAudioPlayingRef.current = true;
    setIsReplySpeaking(true);
    setVoiceState("speaking");
    player.src = nextUrl;
    player.preload = "auto";
    player.currentTime = 0;
    player.playbackRate = voiceSpeed === "slow" ? 0.9 : voiceSpeed === "fast" ? 1.1 : 1.0;

    const startPlayback = () => {
      void player.play().catch(() => {
        URL.revokeObjectURL(nextUrl);
        playNextQueuedAudio();
      });
    };

    if (player.readyState >= 2) {
      startPlayback();
    } else {
      player.onloadeddata = () => {
        startPlayback();
      };
    }

    player.onended = () => {
      speechFallbackRef.current = null;
      URL.revokeObjectURL(nextUrl);
      playNextQueuedAudio();
    };
    player.onerror = () => {
      URL.revokeObjectURL(nextUrl);
      const fallback = speechFallbackRef.current;
      speechFallbackRef.current = null;
      if (fallback) {
        audioQueueRef.current = [];
        isAudioPlayingRef.current = false;
        setIsReplySpeaking(false);
        fallbackSpeakInBrowser(fallback.text, fallback.sentiment);
        return;
      }
      playNextQueuedAudio();
    };
  };

  const playAssistantSpeech = async (text: string, sentiment: SentimentTag, targetPatientId?: string) => {
    const effectivePatientId = targetPatientId ?? patientId;
    if (!effectivePatientId) return;
    speechFallbackRef.current = { text, sentiment };
    const ttsStartedAt = performance.now();
    try {
      const response = await api.streamCompanionSpeech(effectivePatientId, {
        text,
        language: "en",
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
      let firstChunkAt: number | null = null;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          if (!firstChunkAt) {
            firstChunkAt = performance.now();
          }
        }
      }

      setLatencyMetrics((prev) => ({
        ...prev,
        tts_first_audio_ms: firstChunkAt ? Math.round(firstChunkAt - ttsStartedAt) : prev.tts_first_audio_ms,
        tts_total_ms: Math.round(performance.now() - ttsStartedAt)
      }));

      const audioBlob = new Blob(chunks, { type: contentType.includes("wav") ? "audio/wav" : "audio/mpeg" });
      if (audioBlob.size < 2048) {
        throw new Error("TTS audio payload too small");
      }
      const audioUrl = URL.createObjectURL(audioBlob);
      audioQueueRef.current.push(audioUrl);
      if (!isAudioPlayingRef.current) {
        playNextQueuedAudio();
      }
    } catch {
      fallbackSpeakInBrowser(text, sentiment);
      setVoiceState("idle");
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
      localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
      localStorage.setItem(TONE_STORAGE_KEY, preferences.tone);
    } catch {
      // Keep existing local defaults when backend preference loading fails.
    }
  };

  const handleResponse = async (userInput: string, source: "voice" | "text" | "action" = "text") => {
    autoResumeListeningRef.current = source === "voice" && !isGratitudeClose(userInput);
    setShowRetryChips(false);
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
    setVoiceState("thinking");

    const assistantMessageId = `assistant-stream-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    let streamedReply = "";
    const chatStartedAt = performance.now();
    let hasFirstToken = false;

    const ensureAssistantPlaceholder = () => {
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);
    };

    const applyStreamEvent = (event: CompanionStreamEvent) => {
      if (event.type === "assistant_token") {
        if (!hasFirstToken) {
          hasFirstToken = true;
          setLatencyMetrics((prev) => ({
            ...prev,
            chat_first_token_ms: Math.round(performance.now() - chatStartedAt),
          }));
        }
        streamedReply = `${streamedReply}${event.token}`;
        const sanitizedStreamedReply = stripControlTags(streamedReply);
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId ? { ...message, content: sanitizedStreamedReply } : message
          )
        );
      }
    };

    try {
      ensureAssistantPlaceholder();
      let result: CompanionChatResponse;
      try {
        result = await api.streamCompanionChat(
          {
            patient_id: activePatientId,
            message: userInput,
            language: "en",
          },
          applyStreamEvent
        );
      } catch {
        const fallbackResult = await api.companionChat({
          patient_id: activePatientId,
          message: userInput,
          language: "en",
        });
        streamedReply = fallbackResult.reply;
        result = fallbackResult;
      }

      const finalReply = stripControlTags((streamedReply || result.reply).trim());
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: finalReply,
                sentiment: result.sentiment,
                timestamp: new Date(),
              }
            : message
        )
      );
      setCurrentSentiment(result.sentiment);
      setLatencyMetrics((prev) => ({
        ...prev,
        chat_total_ms: Math.round(performance.now() - chatStartedAt),
        chat_first_token_ms: result.latency_ms?.chat_first_token_ms ?? prev.chat_first_token_ms,
      }));
      void playAssistantSpeech(finalReply, result.sentiment, activePatientId);

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
      setMessages((prev) => prev.filter((item) => item.id !== assistantMessageId));
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
      if (!isAudioPlayingRef.current) setVoiceState("idle");
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
          // Keep silent here; auth flow will surface its own error states.
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
    const BASE_SILENCE_MS = 2200;
    const EXTENDED_SILENCE_MS = 1200;
    const MAX_SILENCE_MS = 3800;

    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.maxAlternatives = 3;
    recognitionInstance.lang = "en-IN";

    const resetCapturedText = () => {
      setLiveTranscript("");
      setInterimTranscript("");
      finalTranscriptRef.current = "";
      lastInterimRef.current = "";
      latestLiveTranscriptRef.current = "";
    };

    const scheduleSilenceStop = () => {
      if (silenceStopTimerRef.current !== null) window.clearTimeout(silenceStopTimerRef.current);
      const now = Date.now();
      const shouldExtend = now - lastSpeechActivityAtRef.current <= 1200;
      const timeoutMs = Math.min(
        MAX_SILENCE_MS,
        BASE_SILENCE_MS + (shouldExtend ? EXTENDED_SILENCE_MS : 0)
      );
      silenceStopTimerRef.current = window.setTimeout(() => {
        recognitionRef.current?.stop();
      }, timeoutMs);
    };

    const finalizeSpeechTurn = async (manualStop: boolean) => {
      if (utteranceHandledRef.current) return;
      clearSpeechTimers();
      setVoiceState("finalizing");
      await stopRecordingCapture();

      const browserTranscript = normalizeTranscriptText(
        mergeTranscriptParts(
          mergeTranscriptParts(finalTranscriptRef.current.trim(), lastInterimRef.current),
          latestLiveTranscriptRef.current
        ).trim()
      );
      const audioBlob = capturedAudioRef.current;
      const audioBytes = audioBlob?.size ?? 0;
      const listenDurationMs = Math.max(0, Date.now() - recognitionStartedAtRef.current);
      setLatencyMetrics((prev) => ({ ...prev, capture_ms: listenDurationMs }));

      let serverTranscript = "";
      let serverQualityScore = 0;
      let sttServiceUnavailable = false;
      if (
        audioBlob &&
        patientId &&
        (audioBytes >= MIN_AUDIO_BLOB_BYTES || browserTranscript.length === 0)
      ) {
        setVoiceState("transcribing");
        try {
          const stt = await api.transcribeCompanionAudio(patientId, audioBlob, inputLanguage, listenDurationMs);
          serverTranscript = normalizeTranscriptText(stt.transcript);
          serverQualityScore = stt.quality_score ?? transcriptQualityScore(serverTranscript, listenDurationMs, audioBytes);
          setLatencyMetrics((prev) => ({
            ...prev,
            stt_ms: typeof stt.stt_ms === "number" ? stt.stt_ms : prev.stt_ms
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error ?? "");
          sttServiceUnavailable = /local[_\s-]?stt|local_stt_provider_error|stt.*(unreachable|failed|timeout)|502|503/i.test(
            message
          );
          serverTranscript = "";
        }
      }

      const selected = VOICE_PIPELINE_V2_ENABLED
        ? pickFinalTranscript(
            browserTranscript,
            { transcript: serverTranscript, qualityScore: serverQualityScore },
            listenDurationMs,
            audioBytes
          )
        : (() => {
            const fallbackTranscript = normalizeTranscriptText(serverTranscript || browserTranscript);
            if (!fallbackTranscript) return null;
            return {
              transcript: fallbackTranscript,
              source: serverTranscript ? "server" : "browser",
              qualityScore: 1
            } as TranscriptCandidate;
          })();

      const relaxedFallback = pickRelaxedFallbackTranscript(
        browserTranscript,
        { transcript: serverTranscript, qualityScore: serverQualityScore },
        listenDurationMs,
        audioBytes
      );

      const browserWordCount = countWords(browserTranscript);
      const permissiveBrowserFallback =
        browserTranscript &&
        !serverTranscript &&
        (
          browserWordCount >= 2 ||
          (browserWordCount === 1 && listenDurationMs <= 2500)
        )
          ? ({
              transcript: browserTranscript,
              source: "browser",
              qualityScore: Math.max(0.3, transcriptQualityScore(browserTranscript, listenDurationMs, audioBytes)),
            } as TranscriptCandidate)
          : null;

      const finalSelected =
        selected ??
        (relaxedFallback && relaxedFallback.qualityScore >= 0.35 ? relaxedFallback : null) ??
        permissiveBrowserFallback;

      if (!finalSelected) {
        resetCapturedText();
        if (manualStop && !browserTranscript && !serverTranscript) {
          setPermissionError(null);
          setShowRetryChips(false);
          setVoiceState("idle");
          return;
        }
        setPermissionError(
          sttServiceUnavailable
            ? "Voice service is temporarily unavailable. Please try again in a moment."
            : "I couldn't capture voice clearly. Please try again."
        );
        setShowRetryChips(true);
        setVoiceState("idle");
        return;
      }

      if (
        finalSelected.source === "server" &&
        browserTranscript &&
        finalSelected.transcript.toLowerCase() !== browserTranscript.toLowerCase()
      ) {
        setHeardTranscriptHint(`Heard: ${finalSelected.transcript}`);
        if (transcriptHintTimerRef.current !== null) {
          window.clearTimeout(transcriptHintTimerRef.current);
        }
        transcriptHintTimerRef.current = window.setTimeout(() => {
          setHeardTranscriptHint(null);
          transcriptHintTimerRef.current = null;
        }, 2500);
      } else {
        setHeardTranscriptHint(null);
      }

      const currentTurnId = turnIdRef.current;
      if (!currentTurnId || submittedTurnIdRef.current === currentTurnId) {
        setVoiceState("idle");
        return;
      }
      submittedTurnIdRef.current = currentTurnId;
      utteranceHandledRef.current = true;
      noSpeechRetryCountRef.current = 0;
      shortListenRestartCountRef.current = 0;
      resetCapturedText();
      setVoiceState("thinking");
      void handleResponse(finalSelected.transcript, "voice");
    };

    recognitionInstance.onstart = () => {
      setVoiceState("listening");
      setInterimTranscript("");
      setLiveTranscript("");
      latestLiveTranscriptRef.current = "";
      finalTranscriptRef.current = "";
      lastInterimRef.current = "";
      utteranceHandledRef.current = false;
      speechActivityDetectedRef.current = false;
      recognitionStartedAtRef.current = Date.now();
      lastSpeechActivityAtRef.current = Date.now();
      setPermissionError(null);
      setShowRetryChips(false);
    };

    recognitionInstance.onresult = (event: any) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const best = pickBestAlternative(result);
        if (!best) continue;
        if (result.isFinal) finalText += ` ${best}`;
        else interim += ` ${best}`;
      }

      const interimChunk = normalizeTranscriptText(interim);
      const finalChunk = normalizeTranscriptText(finalText);
      if (finalChunk || interimChunk) {
        speechActivityDetectedRef.current = true;
        lastSpeechActivityAtRef.current = Date.now();
        scheduleSilenceStop();
      }
      if (finalChunk) {
        finalTranscriptRef.current = mergeTranscriptParts(finalTranscriptRef.current, finalChunk);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interimChunk);
      }
      if (interimChunk) lastInterimRef.current = interimChunk;
      const mergedLive = mergeTranscriptParts(finalTranscriptRef.current, interimChunk);
      latestLiveTranscriptRef.current = mergedLive;
      setLiveTranscript(mergedLive);
    };

    recognitionInstance.onend = () => {
      const manualStop = manualStopRequestedRef.current || userStoppedListeningRef.current;
      manualStopRequestedRef.current = false;
      userStoppedListeningRef.current = false;
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        void finalizeSpeechTurn(manualStop);
      }, 300);
    };

    recognitionInstance.onerror = (event: any) => {
      const manualStop = manualStopRequestedRef.current || userStoppedListeningRef.current;
      if (manualStop && (event.error === "aborted" || event.error === "no-speech")) {
        manualStopRequestedRef.current = false;
        userStoppedListeningRef.current = false;
        clearSpeechTimers();
        void stopRecordingCapture();
        resetCapturedText();
        setPermissionError(null);
        setShowRetryChips(false);
        setVoiceState("idle");
        return;
      }

      clearSpeechTimers();
      void stopRecordingCapture();
      setVoiceState("idle");
      if (event.error === "not-allowed") {
        setPermissionError("Please allow microphone access to talk to your companion.");
        setShowTextInput(true);
      } else if (event.error === "no-speech") {
        if (autoResumeListeningRef.current && noSpeechRetryCountRef.current < 1) {
          noSpeechRetryCountRef.current += 1;
          setPermissionError("Didn't catch that clearly. Listening again...");
          setVoiceState("auto_relisten");
          window.setTimeout(() => {
            setVoiceState("idle");
            startVoiceCaptureSession();
          }, 350);
          return;
        }
        setPermissionError("I didn't hear anything. Please try again.");
        setShowRetryChips(true);
      } else {
        setPermissionError("Voice not available. You can type instead.");
        setShowTextInput(true);
      }
    };

    recognitionRef.current = recognitionInstance;

    return () => {
      clearSpeechTimers();
      void stopRecordingCapture();
      if (transcriptHintTimerRef.current !== null) {
        window.clearTimeout(transcriptHintTimerRef.current);
      }
      recognitionInstance.onstart = null;
      recognitionInstance.onresult = null;
      recognitionInstance.onend = null;
      recognitionInstance.onerror = null;
      recognitionInstance.stop();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (escalationTimeoutRef.current !== null) window.clearTimeout(escalationTimeoutRef.current);
      if (transcriptHintTimerRef.current !== null) window.clearTimeout(transcriptHintTimerRef.current);
      void stopRecordingCapture();
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
    if (voiceStateRef.current === "listening") {
      autoResumeListeningRef.current = false;
      userStoppedListeningRef.current = true;
      manualStopRequestedRef.current = true;
      setVoiceState("finalizing");
      recognitionRef.current?.stop();
      return;
    }
    if (voiceStateRef.current !== "idle") {
      return;
    }
    autoResumeListeningRef.current = true;
    noSpeechRetryCountRef.current = 0;
    shortListenRestartCountRef.current = 0;
    startVoiceCaptureSession();
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    autoResumeListeningRef.current = false;
    setVoiceState("thinking");
    const content = textInput.trim();
    setTextInput("");
    void handleResponse(content, "text");
  };

  const handleNewsCardClick = (headline: string) => {
    setShowNewsPanel(false);
    autoResumeListeningRef.current = false;
    void handleResponse(`Tell me more about: ${headline}`, "action");
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
      localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
      localStorage.setItem(TONE_STORAGE_KEY, tonePreference);
      localStorage.setItem(VOICE_SPEED_STORAGE_KEY, voiceSpeed);
      localStorage.setItem(NEWS_CATEGORIES_STORAGE_KEY, JSON.stringify(newsCategories));
      await api.updateCompanionPreferences(patientId, { tone: tonePreference, language: "en" });
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
            <div
              className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] flex items-center justify-center"
              onMouseEnter={() => setIsCompanionHovered(true)}
              onMouseLeave={() => setIsCompanionHovered(false)}
            >
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

            {voiceState !== "idle" && (
              <div className="rounded-full border border-[#E85D2A]/30 bg-white px-4 py-2 text-sm font-bold tracking-wider uppercase text-[#83311A] transition-all duration-300">
                {voiceState === "listening" && "Listening..."}
                {voiceState === "finalizing" && "Processing what I heard..."}
                {voiceState === "transcribing" && "Processing what I heard..."}
                {voiceState === "thinking" && "Responding..."}
                {voiceState === "speaking" && "Responding..."}
                {voiceState === "auto_relisten" && "Listening again..."}
              </div>
            )}

            {voiceState === "listening" && (liveTranscript || interimTranscript) && (
              <div className="w-full max-w-xl">
                <div className="mx-auto rounded-2xl border border-[#E85D2A]/20 bg-white px-4 py-3 text-sm lg:text-base text-[#7A6A63] italic animate-pulse transition-all duration-300">
                  {liveTranscript || interimTranscript}
                </div>
              </div>
            )}
            {heardTranscriptHint && (
              <div className="rounded-2xl border border-[#E85D2A]/20 bg-white px-4 py-2 text-sm font-semibold text-[#7A6A63] transition-all duration-300">
                {heardTranscriptHint}
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
              {showRetryChips && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    aria-label="Repeat voice capture"
                    onClick={() => {
                      setPermissionError(null);
                      setShowRetryChips(false);
                      setShowTextInput(false);
                      autoResumeListeningRef.current = true;
                      startVoiceCaptureSession();
                    }}
                    className="rounded-full border border-[#E85D2A]/30 bg-white px-5 py-2 text-sm font-bold uppercase tracking-wider text-[#83311A] hover:border-[#E85D2A] transition-all duration-300"
                  >
                    Repeat
                  </button>
                  <button
                    type="button"
                    aria-label="Switch to typed input"
                    onClick={() => {
                      setShowTextInput(true);
                      setShowRetryChips(false);
                    }}
                    className="rounded-full border border-[#E85D2A]/30 bg-white px-5 py-2 text-sm font-bold uppercase tracking-wider text-[#83311A] hover:border-[#E85D2A] transition-all duration-300"
                  >
                    Type Instead
                  </button>
                </div>
              )}
              {apiError && (
                <div className="bg-orange-50 border-2 border-[#E85D2A]/40 rounded-2xl px-6 py-4 shadow-sm">
                  <p className="text-sm text-center text-[#83311A] font-semibold">{apiError}</p>
                </div>
              )}
              {(loadingHistory || Boolean(historyError) || messages.length > 0) && (
                <div className="rounded-2xl border border-[#E85D2A]/20 bg-white/90 px-4 py-3 transition-all duration-300">
                  <button
                    type="button"
                    aria-label={chatExpanded ? "Minimize chat history" : "Open chat history"}
                    onClick={() => setChatExpanded((previous) => !previous)}
                    className="w-full flex items-center justify-between text-left transition-all duration-300"
                  >
                    <span className="uppercase tracking-wider text-[#83311A] text-sm font-bold">
                      Conversation
                    </span>
                    <span className="text-sm font-semibold text-[#2A2B3D]">
                      {chatExpanded ? "Minimize Chat" : "Open Chat"}
                    </span>
                  </button>
                </div>
              )}
              {chatExpanded && (loadingHistory || Boolean(historyError) || messages.length > 0) && (
                <ChatHistory messages={messages} loading={loadingHistory} error={historyError} />
              )}
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

