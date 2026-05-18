export const config = {
  port: Number(process.env["PORT"]) || 3000,
  apiKey: process.env["API_KEY"] || "nova-secret-key",
  baseUrl: process.env["BASE_URL"] || "http://localhost:3000",
  ownerNumber: process.env["OWNER_NUMBER"] || "",
  sessionPath: process.env["SESSION_PATH"] || ".nova-session",
  nodeEnv: process.env["NODE_ENV"] || "development",
};
