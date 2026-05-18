import { WebSocketServer, WebSocket } from "ws";
import { type Server } from "node:http";
import { logger } from "../lib/logger.js";

let wss: WebSocketServer | null = null;

export function setupWebSocket(server: Server): void {
  wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws: WebSocket, req) => {
    const ip = req.socket.remoteAddress;
    logger.info({ ip }, "WebSocket client connected");
    ws.send(JSON.stringify({ type: "connected", message: "NOVA API WebSocket ready" }));
    ws.on("close", () => logger.info({ ip }, "WebSocket client disconnected"));
    ws.on("error", (err) => logger.warn({ err, ip }, "WebSocket error"));
  });
  logger.info("WebSocket server initialized at /ws");
}

export function broadcast(data: unknown): void {
  if (!wss) return;
  const json = JSON.stringify(data);
  wss.clients.forEach((c) => { if (c.readyState === WebSocket.OPEN) c.send(json); });
}

export function getWSClientCount(): number { return wss?.clients.size ?? 0; }
