import { Router, type IRouter } from "express";
import { getCommands, setCommandEnabled } from "../services/commandManager.js";
import { apiKeyAuth } from "../middlewares/auth.js";

const router: IRouter = Router();

router.get("/commands", apiKeyAuth, (_req, res) => {
  res.json({ success: true, commands: getCommands() });
});

router.patch("/commands/:name", apiKeyAuth, (req, res) => {
  const { enabled } = req.body as { enabled?: boolean };
  if (enabled === undefined) { res.status(400).json({ success: false, error: "Campo 'enabled' requerido" }); return; }
  const ok = setCommandEnabled(req.params["name"]!, enabled);
  if (!ok) { res.status(404).json({ success: false, error: "Comando no encontrado" }); return; }
  res.json({ success: true, message: `Comando '${req.params["name"]}' ${enabled ? "activado" : "desactivado"}` });
});

export default router;
