# Saya.ai Backend

Node.js, TypeScript, Express, and Supabase backend for Saya.ai, an India-first elder care companion.

## Core Capabilities

- Prescription OCR with Google Cloud Vision and Groq-based medicine extraction.
- Caregiver verification before any extracted medicine activates.
- Curated Indian drug interaction lookup with openFDA/RxNorm fallback support.
- Exotel medication reminder calls with Amazon Polly TTS, IVR confirmation, retries, and SMS alerts.
- Supabase-backed companion chat with patient memory, NewsAPI context, sentiment tagging, and approved-contact escalation.
- Demo dashboard data for hackathon presentation flows.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run seed
```

## Safety Invariants

- Medical warnings are blocked until the prescription is caregiver-verified.
- Warning facts come from curated Supabase records or external medical-label/normalization APIs, never from LLM free text.
- Companion outreach is limited to caregiver-approved contacts.
- Emotional escalation requires two consecutive negative sentiment messages.
