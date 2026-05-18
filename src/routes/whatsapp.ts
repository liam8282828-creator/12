import { Router, type IRouter } from "express";
import QRCode from "qrcode";
import { apiKeyAuth } from "../middlewares/auth.js";
import { getQR, getConnectionStatus, requestPairingCode, sendTextMessage, sendImageMessage, sendAudioMessage, restartSession } from "../services/whatsapp.js";
import { getWSClientCount } from "../services/websocket.js";
import { config } from "../config/index.js";

const router: IRouter = Router();
router.use(apiKeyAuth);

function wrap(fn: (req: any, res: any) => Promise<void>) {
  return (req: any, res: any) => fn(req, res).catch((e: unknown) => res.status(500).json({ success: false, error: e instanceof Error ? e.message : String(e) }));
}

router.get("/status", wrap(async (_req, res) => {
  const wa = getConnectionStatus();
  res.json({ success: true, api: "NOVA API", version: "2.0.0", uptime: Math.floor(process.uptime()), wsClients: getWSClientCount(), owner: config.ownerNumber || null, nodeEnv: config.nodeEnv, whatsapp: wa });
}));

router.get("/qr", wrap(async (req, res) => {
  const raw = getQR();
  if (!raw) {
    const s = getConnectionStatus();
    res.status(s.status === "connected" ? 200 : 202).json({ success: s.status === "connected", status: s.status, message: s.status === "connected" ? "Ya conectado" : "QR no disponible aún" });
    return;
  }
  if (req.query["format"] === "image") { res.setHeader("Content-Type", "image/png"); res.send(await QRCode.toBuffer(raw, { type: "png", width: 300 })); return; }
  res.json({ success: true, qr: raw, qrImage: await QRCode.toDataURL(raw, { width: 300 }) });
}));

router.post("/pair", wrap(async (req, res) => {
  const { phone } = req.body as { phone?: string };
  if (!phone) { res.status(400).json({ success: false, error: "Campo 'phone' requerido" }); return; }
  const code = await requestPairingCode(phone);
  res.json({ success: true, code });
}));

router.post("/send-message", wrap(async (req, res) => {
  const { to, message } = req.body as { to?: string; message?: string };
  if (!to || !message) { res.status(400).json({ success: false, error: "Campos 'to' y 'message' requeridos" }); return; }
  const r = await sendTextMessage(to, message);
  res.json({ success: true, messageId: r?.key?.id ?? null });
}));

router.post("/send-image", wrap(async (req, res) => {
  const { to, url, caption } = req.body as { to?: string; url?: string; caption?: string };
  if (!to || !url) { res.status(400).json({ success: false, error: "Campos 'to' y 'url' requeridos" }); return; }
  const r = await sendImageMessage(to, url, caption);
  res.json({ success: true, messageId: r?.key?.id ?? null });
}));

router.post("/send-audio", wrap(async (req, res) => {
  const { to, url, ptt } = req.body as { to?: string; url?: string; ptt?: boolean };
  if (!to || !url) { res.status(400).json({ success: false, error: "Campos 'to' y 'url' requeridos" }); return; }
  const r = await sendAudioMessage(to, url, ptt);
  res.json({ success: true, messageId: r?.key?.id ?? null });
}));

router.post("/restart", wrap(async (_req, res) => {
  res.json({ success: true, message: "Reiniciando sesión de WhatsApp..." });
  setTimeout(() => { restartSession().catch(() => {}); }, 500);
}));

export default router;
