import http from "node:http";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { initWhatsApp } from "./services/whatsapp.js";
import { setupWebSocket } from "./services/websocket.js";

const rawPort = process.env["PORT"];
if (!rawPort) throw new Error("PORT environment variable is required.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT: "${rawPort}"`);

const server = http.createServer(app);
setupWebSocket(server);

server.listen(port, () => {
  logger.info({ port }, "NOVA API server listening");
  initWhatsApp().catch((err) => logger.error({ err }, "Failed to initialize WhatsApp"));
});
