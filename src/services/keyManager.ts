import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config/index.js";

export interface ApiKey {
  id: string;
  key: string;
  label: string;
  createdAt: string;
  active: boolean;
  botUrl: string | null;
  botName: string | null;
}

function keysFile(): string {
  return path.resolve(process.cwd(), config.sessionPath, "keys.json");
}

function ensureDir(): void {
  const dir = path.resolve(process.cwd(), config.sessionPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function loadKeys(): ApiKey[] {
  try {
    ensureDir();
    const f = keysFile();
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf-8")) as ApiKey[];
  } catch {}
  return [];
}

function saveKeys(keys: ApiKey[]): void {
  try {
    ensureDir();
    fs.writeFileSync(keysFile(), JSON.stringify(keys, null, 2));
  } catch {}
}

export function generateKey(label = "Mi Bot"): ApiKey {
  const keys = loadKeys();
  const newKey: ApiKey = {
    id: crypto.randomUUID(),
    key: "nova_" + crypto.randomBytes(20).toString("hex"),
    label,
    createdAt: new Date().toISOString(),
    active: true,
    botUrl: null,
    botName: null,
  };
  keys.push(newKey);
  saveKeys(keys);
  return newKey;
}

export function listKeys(): ApiKey[] {
  return loadKeys();
}

export function validateBotKey(key: string): ApiKey | null {
  const keys = loadKeys();
  return keys.find((k) => k.key === key && k.active) ?? null;
}

export function revokeKey(id: string): boolean {
  const keys = loadKeys();
  const idx = keys.findIndex((k) => k.id === id);
  if (idx === -1) return false;
  keys[idx]!.active = false;
  saveKeys(keys);
  return true;
}

export function updateKeyBot(key: string, botUrl: string, botName: string): void {
  const keys = loadKeys();
  const k = keys.find((item) => item.key === key);
  if (k) {
    k.botUrl = botUrl;
    k.botName = botName;
    saveKeys(keys);
  }
}
