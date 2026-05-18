import { type Request, type Response, type NextFunction } from "express";
import { config } from "../config/index.js";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers["x-api-key"];
  if (!key || key !== config.apiKey) {
    res.status(403).json({ success: false, error: "Unauthorized", message: "Invalid or missing x-api-key header" });
    return;
  }
  next();
}
