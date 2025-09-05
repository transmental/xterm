import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type StoredState = {
  codeVerifier: string;
  state: string;
};

const DIR = join(homedir(), ".xterm");
const TOKENS_FILE = join(DIR, "tokens.json");
const STATE_FILE = join(DIR, "oauth_state.json");

export function ensureConfigDir() {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
}

export function saveTokens(tokens: StoredTokens) {
  ensureConfigDir();
  writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), "utf8");
}

export function loadTokens(): StoredTokens | null {
  try {
    const raw = readFileSync(TOKENS_FILE, "utf8");
    const obj = JSON.parse(raw) as StoredTokens;
    if (!obj.accessToken || !obj.refreshToken || !obj.expiresAt) return null;
    return obj;
  } catch {
    return null;
  }
}

export function saveOAuthTemp(state: StoredState) {
  ensureConfigDir();
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

export function loadOAuthTemp(): StoredState | null {
  try {
    const raw = readFileSync(STATE_FILE, "utf8");
    return JSON.parse(raw) as StoredState;
  } catch {
    return null;
  }
}
