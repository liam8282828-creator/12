import { Router, type IRouter } from "express";
import { apiKeyAuth } from "../middlewares/auth.js";
import { registerBot, unregisterBot, getBotStatus, getRegisteredBot } from "../services/botRegistry.js";

const router: IRouter = Router();
router.use(apiKeyAuth);

function wrap(fn: (req: any, res: any) => Promise<void>) {
  return (req: any, res: any) => fn(req, res).catch((e: unknown) => res.status(500).json({ success: false, error: e instanceof Error ? e.message : String(e) }));
}

router.post("/register-bot", wrap(async (req, res) => {
  const { url, key } = req.body as { url?: string; key?: string };
  if (!url || !key) { res.status(400).json({ success: false, error: "Campos 'url' y 'key' requeridos. Genera una key en el panel → API Keys." }); return; }
  const info = await registerBot(url, key);
  res.json({ success: true, message: `Bot '${info.name}' conectado exitosamente`, bot: { name: info.name, version: info.version, prefix: info.prefix, commandCount: info.commands.length, commands: info.commands } });
}));

router.delete("/register-bot", wrap(async (_req, res) => {
  unregisterBot();
  res.json({ success: true, message: "Bot desconectado" });
}));

router.get("/bot-status", wrap(async (_req, res) => {
  res.json({ success: true, ...getBotStatus() });
}));

router.get("/bot-commands", wrap(async (_req, res) => {
  const bot = getRegisteredBot();
  if (!bot) { res.status(404).json({ success: false, error: "No hay bot registrado." }); return; }
  res.json({ success: true, botName: bot.info.name, prefix: bot.info.prefix, commandCount: bot.info.commands.length, commands: bot.info.commands });
}));

router.post("/bot-reload", wrap(async (_req, res) => {
  const bot = getRegisteredBot();
  if (!bot) { res.status(404).json({ success: false, error: "No hay bot registrado." }); return; }
  const r = await bot.client.get("/info");
  bot.info = r.data;
  res.json({ success: true, message: "Info del bot actualizada", commandCount: bot.info.commands.length });
}));

export default router;
