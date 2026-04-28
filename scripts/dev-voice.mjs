import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const backendCwd = path.join(root, "backend");
const frontendCwd = path.join(root, "frontend");

const children = [];

function start(name, command, cwd) {
  const child = spawn(command, {
    cwd,
    shell: true,
    stdio: "inherit",
    env: process.env,
  });
  children.push(child);
  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`[dev:voice] ${name} exited via signal ${signal}`);
    } else {
      console.log(`[dev:voice] ${name} exited with code ${code}`);
    }
  });
  return child;
}

function shutdownAll() {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
}

process.on("SIGINT", () => {
  shutdownAll();
  process.exit(0);
});
process.on("SIGTERM", () => {
  shutdownAll();
  process.exit(0);
});

console.log("[dev:voice] Starting local STT service, backend API, and frontend app...");
console.log("[dev:voice] Piper CLI is invoked by backend at synthesis time (no separate HTTP server needed).");

start("local-stt", "python voice_services/stt_service.py", backendCwd);
start("backend", "npm run dev", backendCwd);
start("frontend", "npm run dev", frontendCwd);
