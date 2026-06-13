import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { initRealtime } from "./lib/realtime";

async function main() {
  const app = createApp();
  const server = http.createServer(app);
  initRealtime(server);
  server.listen(env.port, () => {
    console.log(`🚀 Smart Notes API running at http://localhost:${env.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
