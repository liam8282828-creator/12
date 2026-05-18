import fs from "node:fs";
import path from "node:path";
import { config } from "../config/index.js";

export interface ManagedCommand {
  name: string; description: string; usage?: string; aliases?: string[]; enabled: boolean;
}

function stateFile(): string {
  return path.resolve(process.cwd(), config.sessionPath, "commands.json");
}
function ensureDir(): void {
  const d = path.resolve(process.cwd(), config.sessionPath);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}
function loadState(): Record<string, boolean> {
  try { ensureDir(); const f = stateFile(); if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf-8")); } catch {}
  return {};
}
function saveState(s: Record<string, boolean>): void {
  try { ensureDir(); fs.writeFileSync(stateFile(), JSON.stringify(s, null, 2)); } catch {}
}

let commandList: ManagedCommand[] = [];

export function syncCommands(raw: Array<{ name: string; description: string; usage?: string; aliases?: string[] }>): void {
  const state = loadState();
  commandList = raw.map((c) => ({ ...c, enabled: state[c.name] !== undefined ? state[c.name]! : true }));
}
export function getCommands(): ManagedCommand[] { return commandList; }
export function setCommandEnabled(name: string, enabled: boolean): boolean {
  const cmd = commandList.find((c) => c.name === name);
  if (!cmd) return false;
  cmd.enabled = enabled;
  const s = loadState(); s[name] = enabled; saveState(s);
  return true;
}
export function isCommandEnabled(name: string): boolean {
  return commandList.find((c) => c.name === name)?.enabled ?? true;
}
