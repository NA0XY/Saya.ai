#!/usr/bin/env python
"""
Local faster-whisper STT microservice for Saya companion.

Endpoints:
- GET /health
- POST /transcribe (multipart form-data: audio=<file>, optional language, capture_ms)
"""

from __future__ import annotations

import os
import tempfile
import time
from dataclasses import dataclass
from typing import Any

from flask import Flask, jsonify, request
from faster_whisper import WhisperModel


MODEL_NAME = os.environ.get("LOCAL_STT_MODEL", "small.en")
DEVICE = os.environ.get("LOCAL_STT_DEVICE", "cuda")
COMPUTE_TYPE = os.environ.get("LOCAL_STT_COMPUTE_TYPE", "float16")
HOST = os.environ.get("LOCAL_STT_HOST", "127.0.0.1")
PORT = int(os.environ.get("LOCAL_STT_PORT", "7001"))
BEAM_SIZE = int(os.environ.get("LOCAL_STT_BEAM_SIZE", "5"))
VAD_FILTER = os.environ.get("LOCAL_STT_VAD_FILTER", "true").lower() == "true"
TEMPERATURE = float(os.environ.get("LOCAL_STT_TEMPERATURE", "0"))
CONDITION_ON_PREVIOUS_TEXT = (
    os.environ.get("LOCAL_STT_CONDITION_ON_PREVIOUS_TEXT", "false").lower() == "true"
)
INITIAL_PROMPT = os.environ.get(
    "LOCAL_STT_INITIAL_PROMPT",
    "Conversation in English for elder care support. Common words include medicine, family, pain, sleep, breakfast, lunch, dinner, water, and names.",
)


@dataclass
class SegmentStats:
    duration_s: float = 0.0
    avg_logprob_sum: float = 0.0
    no_speech_prob_sum: float = 0.0
    count: int = 0

    def add(self, segment: Any) -> None:
        self.duration_s += max(0.0, float(segment.end) - float(segment.start))
        self.avg_logprob_sum += float(getattr(segment, "avg_logprob", -1.2))
        self.no_speech_prob_sum += float(getattr(segment, "no_speech_prob", 0.25))
        self.count += 1

    @property
    def avg_logprob(self) -> float:
        if self.count <= 0:
            return -1.2
        return self.avg_logprob_sum / self.count

    @property
    def avg_no_speech_prob(self) -> float:
        if self.count <= 0:
            return 0.25
        return self.no_speech_prob_sum / self.count


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def normalize_text(text: str) -> str:
    cleaned = " ".join(text.strip().split())
    return cleaned


def confidence_from_stats(stats: SegmentStats) -> float:
    # Map avg_logprob from typical Whisper range [-2.0, -0.2] to [0, 1].
    logprob_score = clamp((stats.avg_logprob + 2.0) / 1.8, 0.0, 1.0)
    no_speech_score = 1.0 - clamp(stats.avg_no_speech_prob, 0.0, 1.0)
    confidence = (logprob_score * 0.7) + (no_speech_score * 0.3)
    return round(clamp(confidence, 0.0, 1.0), 3)


def quality_from_text(text: str, confidence: float, audio_ms: int) -> float:
    words = [w for w in text.split(" ") if w]
    score = 0.45 + confidence * 0.35
    if len(words) >= 2:
        score += 0.08
    if len(words) >= 5:
        score += 0.06
    if audio_ms > 4500 and len(words) <= 2:
        score -= 0.2
    return round(clamp(score, 0.0, 1.0), 3)


print(
    f"[STT] Loading faster-whisper model='{MODEL_NAME}' device='{DEVICE}' compute_type='{COMPUTE_TYPE}'..."
)
MODEL = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)
print("[STT] Model loaded.")

app = Flask(__name__)


@app.get("/health")
def health() -> Any:
    return jsonify(
        {
            "ok": True,
            "engine": "local-faster-whisper",
            "model": MODEL_NAME,
            "device": DEVICE,
            "compute_type": COMPUTE_TYPE,
        }
    )


@app.post("/transcribe")
def transcribe() -> Any:
    file = request.files.get("audio")
    if file is None:
        return jsonify({"error": "audio file is required"}), 400

    requested_language = (request.form.get("language") or "en").lower()
    # v1 is English-only. Keep language fixed to en.
    language = "en"

    capture_ms_raw = request.form.get("capture_ms")
    capture_ms = None
    if capture_ms_raw:
        try:
            capture_ms = max(0, int(float(capture_ms_raw)))
        except ValueError:
            capture_ms = None

    suffix = ".webm"
    filename = (file.filename or "").lower()
    if "." in filename:
        suffix = f".{filename.rsplit('.', 1)[-1]}"

    started = time.perf_counter()
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            file.save(tmp)
            temp_path = tmp.name

        segments, _info = MODEL.transcribe(
            temp_path,
            beam_size=BEAM_SIZE,
            vad_filter=VAD_FILTER,
            language=language,
            temperature=TEMPERATURE,
            condition_on_previous_text=CONDITION_ON_PREVIOUS_TEXT,
            initial_prompt=INITIAL_PROMPT,
        )

        stats = SegmentStats()
        parts: list[str] = []
        for segment in segments:
            text = normalize_text(segment.text)
            if text:
                parts.append(text)
            stats.add(segment)

        transcript = normalize_text(" ".join(parts))
        if not transcript:
            return jsonify({"error": "empty transcript"}), 422

        stt_ms = int((time.perf_counter() - started) * 1000)
        audio_ms = capture_ms if capture_ms is not None else int(stats.duration_s * 1000)
        confidence_proxy = confidence_from_stats(stats)
        quality_score = quality_from_text(transcript, confidence_proxy, audio_ms)

        return jsonify(
            {
                "transcript": transcript,
                "language": language,
                "requested_language": requested_language,
                "engine": "local-faster-whisper",
                "stt_ms": stt_ms,
                "audio_ms": audio_ms,
                "confidence_proxy": confidence_proxy,
                "quality_score": quality_score,
            }
        )
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"transcription failed: {str(exc)}"}), 500
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


if __name__ == "__main__":
    app.run(host=HOST, port=PORT, debug=False)

