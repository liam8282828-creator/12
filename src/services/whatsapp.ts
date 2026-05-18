import makeWASocket, {
  DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore, type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import path from "node:path";
import fs from "node:fs";
import { logger as rootLogger } from "../lib/logger.js";
import { broadcast } from "./websocket.js";
import { config } from "../config/index.js";
import { forwardMessageToBot } from "./botRegistry.js";

const logger = rootLogger.child({ module: "whatsapp" });
export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "logged_out";

let sock: WASocket | null = null;
let qrCode: string | null = null;
let connectionStatus: ConnectionStatus = "disconnected";
let phoneNumber: string | null = null;
let retryCount = 0;
const MAX_RETRIES = 5;
const SESSION_DIR = path.resolve(process.cwd(), config.sessionPath);

export function getQR(): string | null { return qrCode; }
export function getConnectionStatus() { return { status: connectionStatus, hasQR: qrCode !== null, phone: phoneNumber, retries: retryCount }; }
export function getSocket(): WASocket | null { return sock; }

function ensureDir() { if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true }); }
function clearSession() {
  try {
    if (fs.existsSync(SESSION_DIR)) {
      for (const f of fs.readdirSync(SESSION_DIR)) {
        if (f !== "keys.json" && f !== "commands.json") fs.unlinkSync(path.join(SESSION_DIR, f));
      }
    }
  } catch {}
}

export async function initWhatsApp(): Promise<void> {
  ensureDir();
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger as any) },
    printQRInTerminal: false,
    logger: logger.child({ module: "baileys" }) as any,
    browser: ["NOVA API", "Chrome", "4.0.0"],
    connectTimeoutMs: 60_000, keepAliveIntervalMs: 30_000,
    retryRequestDelayMs: 2_000, maxMsgRetryCount: 3,
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) { qrCode = qr; broadcast({ type: "qr", qr }); }
    if (connection === "close") {
      connectionStatus = "disconnected"; qrCode = null;
      const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
      broadcast({ type: "connection", status: "disconnected" });
      if (code === DisconnectReason.loggedOut) {
        connectionStatus = "logged_out"; clearSession();
        broadcast({ type: "connection", status: "logged_out" });
      } else if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(() => { initWhatsApp().catch(() => {}); }, Math.min(5_000 * retryCount, 30_000));
      }
    } else if (connection === "open") {
      connectionStatus = "connected"; qrCode = null; retryCount = 0;
      phoneNumber = sock?.user?.id?.split(":")[0] ?? null;
      broadcast({ type: "connection", status: "connected", phone: phoneNumber });
    } else if (connection === "connecting") {
      connectionStatus = "connecting";
      broadcast({ type: "connection", status: "connecting" });
    }
  });

  sock.ev.on("messages.upsert", ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      const simplified = {
        id: msg.key.id, from: msg.key.remoteJid, fromMe: msg.key.fromMe,
        text: msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? msg.message?.imageMessage?.caption ?? null,
        timestamp: msg.messageTimestamp,
        isGroup: msg.key.remoteJid?.endsWith("@g.us") ?? false,
      };
      forwardMessageToBot(simplified).catch(() => {});
      broadcast({ type: "message", message: simplified });
    }
  });
}

export async function restartSession(): Promise<void> {
  if (sock) { try { sock.ev.removeAllListeners(); await sock.ws.close(); } catch {} sock = null; }
  clearSession(); retryCount = 0; connectionStatus = "disconnected"; qrCode = null; phoneNumber = null;
  await initWhatsApp();
}
export async function requestPairingCode(phone: string): Promise<string> {
  if (!sock) throw new Error("Socket no inicializado. Espera el QR.");
  return sock.requestPairingCode(phone.replace(/[^0-9]/g, ""));
}
function fmt(to: string): string {
  const c = to.replace(/[^0-9@.]/g, "");
  return c.includes("@") ? c : `${c}@s.whatsapp.net`;
}
export async function sendTextMessage(to: string, text: string) {
  if (!sock || connectionStatus !== "connected") throw new Error("WhatsApp no está conectado");
  return sock.sendMessage(fmt(to), { text });
}
export async function sendImageMessage(to: string, src: string, caption?: string) {
  if (!sock || connectionStatus !== "connected") throw new Error("WhatsApp no está conectado");
  const jid = fmt(to);
  if (src.startsWith("data:")) { const b = src.split(",")[1]; if (!b) throw new Error("base64 inválido"); return sock.sendMessage(jid, { image: Buffer.from(b, "base64"), caption }); }
  return sock.sendMessage(jid, { image: { url: src }, caption });
}
export async function sendAudioMessage(to: string, src: string, ptt = false) {
  if (!sock || connectionStatus !== "connected") throw new Error("WhatsApp no está conectado");
  const jid = fmt(to);
  if (src.startsWith("data:")) { const b = src.split(",")[1]; if (!b) throw new Error("base64 inválido"); return sock.sendMessage(jid, { audio: Buffer.from(b, "base64"), ptt, mimetype: "audio/mp4" }); }
  return sock.sendMessage(jid, { audio: { url: src }, ptt, mimetype: "audio/mp4" });
}
