import fs from "node:fs";
import path from "node:path";

function resolveOptionalPath(rawPath) {
  if (!rawPath || !rawPath.trim()) return null;
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
}

const binaryPath = resolveOptionalPath(process.env.PIPER_BINARY_PATH);
const modelPath = resolveOptionalPath(process.env.PIPER_MODEL_EN_PATH || process.env.PIPER_MODEL_PATH);
const configPath = resolveOptionalPath(process.env.PIPER_CONFIG_EN_PATH || process.env.PIPER_CONFIG_PATH);

const failures = [];
if (!binaryPath) failures.push("PIPER_BINARY_PATH is missing");
if (!modelPath) failures.push("PIPER_MODEL_EN_PATH (or PIPER_MODEL_PATH) is missing");
if (binaryPath && !fs.existsSync(binaryPath)) failures.push(`Piper binary not found: ${binaryPath}`);
if (modelPath && !fs.existsSync(modelPath)) failures.push(`Piper model not found: ${modelPath}`);
if (configPath && !fs.existsSync(configPath)) failures.push(`Piper config not found: ${configPath}`);

if (failures.length > 0) {
  console.error("[VOICE] Piper CLI configuration invalid:");
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log("[VOICE] Piper CLI configuration looks good.");
console.log(` - binary: ${binaryPath}`);
console.log(` - model:  ${modelPath}`);
if (configPath) console.log(` - config: ${configPath}`);
