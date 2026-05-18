import axios, { type AxiosInstance } from "axios";
import { logger as rootLogger } from "../lib/logger.js";
import { broadcast } from "./websocket.js";
import { validateBotKey, updateKeyBot } from "./keyManager.js";
import { syncCommands } from "./commandManager.js";

const logger = rootLogger.child({ module: "bot-registry" });

export interface BotCommand { name: string; description: string; usage?: string; aliases?: string[]; }
export interface BotInfo { name: string; version: string; prefix: string; description?: string; commands: BotCommand[]; }
export interface RegisteredBot { url: string; key: string; info: BotInfo; client: AxiosInstance; registeredAt: Date; lastPing: Date | null; online: boolean; }

let registeredBot: RegisteredBot | null = null;

export function getRegisteredBot(): RegisteredBot | null { return registeredBot; }
export function getBotStatus() {
  if (!registeredBot) return { registered: false };
  return { registered: true, url: registeredBot.url, name: registeredBot.info.name, version: registeredBot.info.version, prefix: registeredBot.info.prefix, description: registeredBot.info.description ?? null, commands: registeredBot.info.commands, commandCount: registeredBot.info.commands.length, registeredAt: registeredBot.registeredAt, lastPing: registeredBot.lastPing, online: registeredBot.online };
}

export async function registerBot(url: string, key: string): Promise<BotInfo> {
  const cleanUrl = url.replace(/\/$/, "");
  const validKey = validateBotKey(key);
  if (!validKey) throw new Error("Key inválida o revocada. Genera una nueva key en el panel → API Keys.");

  const client = axios.create({ baseURL: cleanUrl, headers: { "x-bot-key": key, "Content-Type": "application/json" }, timeout: 12_000 });

  let info: BotInfo;
  try {
    const res = await client.get<BotInfo>("/info");
    info = res.data;
  } catch (err) {
    const msg = axios.isAxiosError(err) ? `No se pudo conectar con el bot en ${cleanUrl}/info — ${err.message}` : String(err);
    throw new Error(msg);
  }

  if (!info.name || !Array.isArray(info.commands)) throw new Error("El bot devolvió una respuesta inválida: falta 'name' o 'commands'");

  registeredBot = { url: cleanUrl, key, info, client, registeredAt: new Date(), lastPing: new Date(), online: true };
  updateKeyBot(key, cleanUrl, info.name);
  syncCommands(info.commands);
  broadcast({ type: "bot_registered", bot: getBotStatus() });
  logger.info({ name: info.name, cmds: info.commands.length }, "Bot registered");
  startHealthCheck();
  return info;
}

export function unregisterBot(): void {
  if (!registeredBot) throw new Error("No hay bot registrado");
  registeredBot = null;
  broadcast({ type: "bot_unregistered" });
}

async function pingBot(): Promise<void> {
  if (!registeredBot) return;
  try {
    await registeredBot.client.get("/info");
    registeredBot.lastPing = new Date();
    if (!registeredBot.online) { registeredBot.online = true; broadcast({ type: "bot_online", name: registeredBot.info.name }); }
  } catch {
    if (registeredBot?.online) { registeredBot.online = false; broadcast({ type: "bot_offline", name: registeredBot.info.name }); }
  }
}

let healthInterval: ReturnType<typeof setInterval> | null = null;
function startHealthCheck(): void {
  if (healthInterval) clearInterval(healthInterval);
  healthInterval = setInterval(() => { pingBot().catch(() => {}); }, 30_000);
}

export async function forwardMessageToBot(message: unknown): Promise<void> {
  if (!registeredBot || !registeredBot.online) return;
  try { await registeredBot.client.post("/message", { message }); } catch {}
}
