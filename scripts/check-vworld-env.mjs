import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const REQUIRED_ENV_NAME = "VITE_VWORLD_API_KEY";
const ENV_FILES = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
];

function normalizeEnvValue(rawValue) {
  const value = rawValue.trim();
  const quote = value[0];

  if (
    (quote === '"' || quote === "'") &&
    value.length > 1 &&
    value[value.length - 1] === quote
  ) {
    return value.slice(1, -1).trim();
  }

  return value;
}

function readEnvFileValue(filePath, name) {
  if (!existsSync(filePath)) return undefined;

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim().replace(/^export\s+/, "");
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([\w.-]+)\s*=\s*(.*)$/);
    if (!match || match[1] !== name) continue;

    return normalizeEnvValue(match[2] ?? "");
  }

  return undefined;
}

function readViteEnvValue(name) {
  let value;

  for (const fileName of ENV_FILES) {
    const nextValue = readEnvFileValue(resolve(process.cwd(), fileName), name);
    if (nextValue !== undefined) value = nextValue;
  }

  return value;
}

const value = (
  process.env[REQUIRED_ENV_NAME] ??
  readViteEnvValue(REQUIRED_ENV_NAME) ??
  ""
).trim();

if (!value) {
  console.error(`${REQUIRED_ENV_NAME} is required for production builds.`);
  console.error(
    "Set it in .env for local builds and as a GitHub Actions secret or variable for Pages deployments.",
  );
  process.exit(1);
}
