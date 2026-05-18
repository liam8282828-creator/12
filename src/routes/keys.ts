import { Router, type IRouter } from "express";
import { generateKey, listKeys, revokeKey } from "../services/keyManager.js";
import { apiKeyAuth } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/keys", apiKeyAuth, (_req, res) => {
  res.json({ success: true, keys: listKeys() });
});

router.post("/keys/generate", apiKeyAuth, (req, res) => {
  const { label } = req.body as { label?: string };
  const key = generateKey(label || "Mi Bot");
  res.json({ success: true, key });
});

router.delete("/keys/:id", apiKeyAuth, (req, res) => {
  const ok = revokeKey(req.params["id"]!);
  if (!ok) { res.status(404).json({ success: false, error: "Key no encontrada" }); return; }
  res.json({ success: true, message: "Key revocada" });
});

export default router;
