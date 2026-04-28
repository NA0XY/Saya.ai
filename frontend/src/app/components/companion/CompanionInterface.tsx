import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DottedBackground } from "../DottedBackground";
import { CompanionAvatar } from "./CompanionAvatar";
import { VoiceButton } from "./VoiceButton";
import { QuickActions } from "./QuickActions";
import { api } from "../../lib/api";

type CompanionMood = "neutral" | "happy" | "concerned";
type VoiceState = "idle" | "listening" | "processing";

export function CompanionInterface() {
  const [mood, setMood] = useState<CompanionMood>("neutral");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [greetingText, setGreetingText] = useState("Namaste. How are you feeling today?");
  const [transcription, setTranscription] = useState("");
  const [response, setResponse] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-IN';

      recognitionInstance.onstart = () => {
        setVoiceState("listening");
        setTranscription("");
        setResponse("");
        setPermissionError(null);
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        setTranscription(transcript);
      };

      recognitionInstance.onend = () => {
        if (transcription) {
          setVoiceState("processing");

          setTimeout(() => {
            handleResponse(transcription).finally(() => setVoiceState("idle"));
          }, 1500);
        } else {
          setVoiceState("idle");
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setVoiceState("idle");

        if (event.error === 'not-allowed') {
          setPermissionError("Please allow microphone access to talk to your companion.");
          setShowTextInput(true);
        } else if (event.error === 'no-speech') {
          setPermissionError("I didn't hear anything. Please try again.");
        } else {
          setPermissionError("Voice not available. You can type instead.");
          setShowTextInput(true);
        }
      };

      setRecognition(recognitionInstance);
    } else {
      setPermissionError("Voice not supported on this browser. Please type instead.");
      setShowTextInput(true);
    }
  }, [transcription]);

  const handleResponse = async (userInput: string) => {
    setApiError(null);
    try {
      const result = await api.companionChat({
        message: userInput,
        context: { lastMood: mood }
      });
      setResponse(result.response);
      setMood(result.mood);
      return;
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Companion backend unavailable");
    }

    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes("tired") || lowerInput.includes("sleepy")) {
      setResponse("You should rest. Did you take your medicine?");
      setMood("concerned");
    } else if (lowerInput.includes("good") || lowerInput.includes("fine") || lowerInput.includes("happy")) {
      setResponse("That's wonderful to hear! Remember to drink water.");
      setMood("happy");
    } else if (lowerInput.includes("pain") || lowerInput.includes("hurt")) {
      setResponse("I'm sorry you're in pain. Let me call your family.");
      setMood("concerned");
    } else {
      setResponse("I understand. I'm here if you need anything.");
      setMood("neutral");
    }
  };

  const handleVoiceClick = () => {
    if (voiceState === "idle" && recognition) {
      try {
        recognition.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        setPermissionError("Voice not available. You can type instead.");
        setShowTextInput(true);
      }
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setTranscription(textInput);
      setVoiceState("processing");

      setTimeout(() => {
        handleResponse(textInput).finally(() => {
          setVoiceState("idle");
          setTextInput("");
        });
      }, 1500);
    }
  };

  const handleCallFamily = () => {
    alert("Calling your family...");
  };

  const handleHelp = () => {
    alert("Getting help...");
    setMood("concerned");
  };

  const handleRemindLater = () => {
    alert("I'll remind you in 1 hour.");
    setMood("happy");
  };

  return (
    <div className="min-h-screen bg-[#F5F1EA] relative overflow-hidden">
      <DottedBackground />

      <div className="relative z-10">
        {/* Header - Clean navbar like landing page */}
        <nav className="h-20 flex items-center justify-between px-8 md:px-16 border-b border-black/5 bg-white/50 backdrop-blur-sm">
          <Link to="/" className="text-3xl font-bold tracking-widest text-[#83311A]">
            SAYA.AI
          </Link>
          <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all">
            <svg className="w-6 h-6 text-[#83311A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </nav>

        {/* Main Content - Side by Side with Landing Page Style */}
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-5rem)] px-6 md:px-12 py-16 gap-8 lg:gap-16">
          
          {/* Left Side - Companion Avatar */}
          <div className="w-full lg:flex-1 flex items-center justify-center">
            <div className="w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
              <CompanionAvatar mood={mood} voiceState={voiceState} />
            </div>
          </div>

          {/* Right Side - Conversation Area - Clean and Spacious */}
          <div className="w-full lg:flex-1 lg:max-w-2xl flex flex-col gap-8">
            
            {/* Greeting Text - Big and Bold */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-[#83311A] leading-tight">
                {greetingText}
              </h1>
            </div>

            {/* Permission Error */}
            {permissionError && (
              <div className="bg-orange-100/80 border-2 border-[#E85D2A] rounded-3xl px-8 py-6 backdrop-blur-sm">
                <p className="text-lg text-center text-gray-800 font-semibold">
                  {permissionError}
                </p>
              </div>
            )}

            {apiError && (
              <div className="bg-orange-100/80 border-2 border-[#E85D2A]/40 rounded-3xl px-8 py-5 backdrop-blur-sm">
                <p className="text-base text-center text-gray-800 font-semibold">
                  Backend companion unavailable: {apiError}. Using local fallback response.
                </p>
              </div>
            )}

            {/* Voice Button Area - Centered */}
            <div className="flex justify-center py-4">
              {!showTextInput ? (
                <VoiceButton
                  state={voiceState}
                  onClick={handleVoiceClick}
                />
              ) : (
                <div className="w-full flex flex-col gap-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                      placeholder="Type your message..."
                      className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#E85D2A] focus:outline-none text-lg font-medium bg-white/80 backdrop-blur-sm transition-all"
                    />
                    <button
                      onClick={handleTextSubmit}
                      disabled={!textInput.trim()}
                      className="bg-[#E85D2A] text-white px-8 py-4 rounded-2xl font-semibold transition-all hover:bg-[#d64d1f] disabled:opacity-40 shadow-lg hover:shadow-xl"
                    >
                      Send
                    </button>
                  </div>
                  {recognition && (
                    <button
                      onClick={() => {
                        setShowTextInput(false);
                        setPermissionError(null);
                      }}
                      className="text-sm text-gray-600 hover:text-[#E85D2A] transition-colors font-medium"
                    >
                      ← Back to voice
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Transcription Display - Subtle */}
            {transcription && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-6 border border-gray-200 shadow-sm animate-fade-in">
                <p className="text-lg leading-relaxed text-gray-900">
                  <span className="font-bold text-[#83311A]">You:</span> "{transcription}"
                </p>
              </div>
            )}

            {/* Response Display - Highlighted */}
            {response && (
              <div className="bg-gradient-to-br from-[#E85D2A]/15 to-orange-100/20 backdrop-blur-sm rounded-2xl px-8 py-6 border border-[#E85D2A]/20 shadow-sm animate-fade-in">
                <p className="text-lg leading-relaxed text-gray-800">
                  <span className="font-bold text-[#E85D2A]">Saya:</span> {response}
                </p>
              </div>
            )}

            {/* Quick Actions - Three Buttons */}
            <div className="pt-4 mt-auto">
              <QuickActions
                onCallFamily={handleCallFamily}
                onHelp={handleHelp}
                onRemindLater={handleRemindLater}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

