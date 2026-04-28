# Local Voice Stack Runbook (English v1)

This project runs a free/local voice pipeline:

- STT: `faster-whisper` microservice (`small.en`) on NVIDIA GPU
- TTS: Piper CLI (primary)
- Fallback: browser TTS (frontend)

## 1) Prerequisites

- NVIDIA GPU with current drivers
- Python 3.10+ on PATH
- Node.js 18+ on PATH
- Piper binary downloaded locally

Optional GPU sanity check:

```bash
nvidia-smi
```

## 2) Install STT service dependencies

From repo root:

```bash
python -m pip install -r backend/voice_services/requirements.txt
```

## 3) Configure backend `.env`

Set these values:

```env
COMPANION_STT_PROVIDER=local_faster_whisper
LOCAL_STT_URL=http://127.0.0.1:7001
LOCAL_STT_TIMEOUT_MS=12000

COMPANION_TTS_PROVIDER=piper
PIPER_BINARY_PATH=./voice_services/bin/piper.exe
PIPER_MODEL_EN_PATH=./voices/en_US-lessac-medium.onnx
PIPER_CONFIG_EN_PATH=./voices/en_US-lessac-medium.onnx.json

# Keep false in production/runtime. This is debug only.
PIPER_HTTP_DEBUG_ENABLED=false
```

## 4) Startup order

Fast path (single command from repo root):

```bash
npm run dev:voice
```

This launches:
- local STT service (`127.0.0.1:7001`)
- backend API (`localhost:3001`)
- frontend app (`localhost:5173`)

## 5) Health checks

From repo root:

```bash
npm run voice:doctor
```

This validates:
- Piper CLI paths
- local STT `/health` endpoint

## 6) Troubleshooting

- `LOCAL_STT_PROVIDER_ERROR`
  - Ensure `python backend/voice_services/stt_service.py` is running.
  - Check `LOCAL_STT_URL` matches actual host/port.

- Piper CLI errors (`PIPER_*`)
  - Verify `PIPER_BINARY_PATH`, `PIPER_MODEL_EN_PATH`, `PIPER_CONFIG_EN_PATH`.
  - Run `npm --prefix backend run tts:piper:check`.

- Slow/CPU STT
  - Set `LOCAL_STT_DEVICE=cuda` and verify `nvidia-smi` sees GPU.
  - You can lower model size (e.g. `base.en`) for more speed.
