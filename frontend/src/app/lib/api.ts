export type UserProfile = {
  id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
  role: "caregiver" | "parent";
};

export type OnboardingPayload = {
  contacts: Array<{ name: string; phone: string }>;
  personality: "warm" | "formal" | "playful";
  language: "english" | "hindi";
};

export type SafetyStatusDto = {
  title: string;
  status: string;
  statusColor: "green" | "orange" | "red" | "blue";
  icon: string;
  description: string;
};

export type AlertDto = {
  id: string;
  type: "medication" | "safety" | "health";
  severity: "low" | "medium" | "high";
  message: string;
  timestamp: string;
};

export type MedicineDto = {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  confidence: "high" | "low";
};

export type HealthVitalsDto = {
  heartRate: Array<{ date: string; value: number }>;
  steps: Array<{ date: string; value: number }>;
  vitalsStatus: "stable" | "warning" | "critical";
};

export type CompanionChatResponse = {
  reply: string;
  sentiment: "joy" | "neutral" | "anxiety" | "sadness";
  memories_updated: boolean;
  escalated?: boolean;
};

export type CompanionTtsRequest = {
  text: string;
  language?: "hi" | "en";
  sentiment?: "joy" | "neutral" | "anxiety" | "sadness";
  tone?: "warm" | "formal" | "playful";
  voiceSpeed?: "slow" | "medium" | "fast";
};

export type CompanionHistoryMessage = {
  id: string;
  patient_id: string;
  role: "user" | "assistant";
  content: string;
  sentiment: "joy" | "neutral" | "anxiety" | "sadness" | null;
  created_at: string;
};

export type CompanionPatientContext = {
  patient_id: string | null;
};

export type PatientMemory = {
  id: string;
  patient_id: string;
  memory_key: string;
  memory_value: string;
  created_at: string;
  updated_at: string;
};

export type NewsItem = {
  id: string;
  headline: string;
  summary?: string | null;
  source?: string | null;
  published_at?: string;
  fetched_at?: string;
  category?: string | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/v1").replace(/\/$/, "");
const COMPANION_API_BASE_URL = (() => {
  if (/\/api\/v1$/.test(API_BASE_URL)) return API_BASE_URL.replace(/\/api\/v1$/, "/api");
  if (/\/v1$/.test(API_BASE_URL)) return API_BASE_URL.replace(/\/v1$/, "/api");
  if (/\/api$/.test(API_BASE_URL)) return API_BASE_URL;
  return `${API_BASE_URL}/api`;
})();
const TOKEN_KEY = "saya.authToken";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function requestWithBase<T>(baseUrl: string, path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.message ?? `Request failed with ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  return requestWithBase<T>(API_BASE_URL, path, options);
}

async function companionRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return requestWithBase<T>(COMPANION_API_BASE_URL, path, options);
}

async function companionBinaryRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${COMPANION_API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed with ${response.status}`);
  }
  return response;
}

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export const api = {
  async authenticateWithGoogle(token: string) {
    const result = await request<{ user: UserProfile; token: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token })
    });
    setAuthToken(result.token);
    return result;
  },

  profile: () => request<UserProfile>("/user/profile"),

  submitOnboarding: (payload: OnboardingPayload) => request<{ status: string }>("/user/onboarding", {
    method: "POST",
    body: JSON.stringify(payload)
  }),

  safetyStatus: () => request<SafetyStatusDto[]>("/dashboard/safety-status"),

  alerts: () => request<AlertDto[]>("/dashboard/alerts"),

  healthVitals: (range: "7d" | "30d" = "7d") => request<HealthVitalsDto>(`/dashboard/health-vitals?range=${range}`),

  extractMedicines: (image: File) => {
    const body = new FormData();
    body.append("image", image);
    return request<{ medicines: MedicineDto[] }>("/medications/extract", { method: "POST", body });
  },

  scheduleMedication: (payload: { drugName: string; time: string; customMessage?: string }) =>
    request<{ id: string; status: string }>("/medications/schedule", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  companionChat: async (payload: { patient_id: string; message: string; language: "hi" | "en" }) => {
    const result = await companionRequest<CompanionChatResponse | ApiEnvelope<CompanionChatResponse>>("/companion/chat", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return unwrapData(result);
  },

  getCompanionPatientContext: async () => {
    const result = await companionRequest<CompanionPatientContext | ApiEnvelope<CompanionPatientContext>>("/companion/patient");
    return unwrapData(result);
  },

  streamCompanionSpeech: (patientId: string, payload: CompanionTtsRequest) =>
    companionBinaryRequest(`/companion/tts/${patientId}/stream`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getCompanionHistory: async (patientId: string) => {
    const result = await companionRequest<CompanionHistoryMessage[] | ApiEnvelope<CompanionHistoryMessage[]>>(`/companion/history/${patientId}`);
    return unwrapData(result);
  },

  getCompanionMemories: async (patientId: string) => {
    const result = await companionRequest<PatientMemory[] | ApiEnvelope<PatientMemory[]>>(`/companion/memories/${patientId}`);
    return unwrapData(result);
  },

  deleteCompanionMemory: async (patientId: string, memoryKey: string) => {
    const result = await companionRequest<{ deleted: boolean } | ApiEnvelope<{ deleted: boolean }>>(
      `/companion/memories/${patientId}/${encodeURIComponent(memoryKey)}`,
      { method: "DELETE" }
    );
    return unwrapData(result);
  },

  updateCompanionPreferences: async (patientId: string, payload: { tone: "warm" | "formal" | "playful"; language: "hi" | "en" }) => {
    const result = await companionRequest<unknown | ApiEnvelope<unknown>>(`/companion/preferences/${patientId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    return unwrapData(result);
  },

  getCompanionPreferences: async (patientId: string) => {
    const result = await companionRequest<{ tone: "warm" | "formal" | "playful"; language: "hi" | "en" } | ApiEnvelope<{ tone: "warm" | "formal" | "playful"; language: "hi" | "en" }>>(
      `/companion/preferences/${patientId}`
    );
    return unwrapData(result);
  },

  async getCompanionNews(): Promise<NewsItem[]> {
    const result = await companionRequest<NewsItem[] | ApiEnvelope<NewsItem[]>>("/companion/news");
    return unwrapData(result);
  }
};
