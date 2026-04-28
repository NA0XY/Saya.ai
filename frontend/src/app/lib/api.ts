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
  response: string;
  mood: "neutral" | "happy" | "concerned";
  actions: Array<{ type: "call_family" | "reminder"; data: Record<string, unknown> }>;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/v1").replace(/\/$/, "");
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.message ?? `Request failed with ${response.status}`;
    throw new Error(message);
  }
  return body as T;
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

  companionChat: (payload: { message: string; context?: { lastMood?: string; location?: string } }) =>
    request<CompanionChatResponse>("/companion/chat", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
