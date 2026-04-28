const localSttUrl = (process.env.LOCAL_STT_URL || "http://127.0.0.1:7001").replace(/\/$/, "");

try {
  const res = await fetch(`${localSttUrl}/health`);
  if (!res.ok) {
    console.error(`[VOICE] Local STT health failed: HTTP ${res.status}`);
    process.exit(1);
  }
  const payload = await res.json();
  console.log("[VOICE] Local STT health OK.");
  console.log(` - engine: ${payload.engine ?? "unknown"}`);
  console.log(` - model: ${payload.model ?? "unknown"}`);
  console.log(` - device: ${payload.device ?? "unknown"}`);
} catch (error) {
  console.error(`[VOICE] Local STT health unreachable: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
