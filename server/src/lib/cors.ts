import type { CorsOptions } from "cors";
import { env } from "../config/env";

/**
 * Origin policy shared by the REST API (Express) and the realtime layer (Socket.IO).
 *
 * The site can be reached by many hostnames depending on the device/network used
 * (localhost, a Bonjour name like clamshell.local, a LAN IP, ...). Rather than
 * pinning a single client URL, we:
 *   1. always allow any origin explicitly listed in CLIENT_URL (comma-separated), and
 *   2. outside production, auto-allow any "local" origin (loopback, *.local, or a
 *      private-range LAN IP) so development just works no matter how it's accessed.
 *
 * In production set CLIENT_URL to your real origin(s) and the auto-allow is off.
 */

const PRIVATE_IPV4 =
  /^(10\.|127\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/;

function isLocalOrigin(origin: string): boolean {
  let host: string;
  try {
    host = new URL(origin).hostname;
  } catch {
    return false;
  }
  if (host === "localhost" || host === "::1") return true;
  if (host.endsWith(".local") || host.endsWith(".localhost")) return true;
  return PRIVATE_IPV4.test(host);
}

function isAllowedOrigin(origin: string): boolean {
  if (env.clientUrls.includes(origin)) return true;
  if (!env.isProd && isLocalOrigin(origin)) return true;
  return false;
}

/** Express-style origin checker; also reused for Socket.IO. */
export const corsOrigin: CorsOptions["origin"] = (origin, callback) => {
  // No Origin header (same-origin navigations, curl, server-to-server) — allow.
  if (!origin) return callback(null, true);
  if (isAllowedOrigin(origin)) return callback(null, true);
  callback(new Error(`Not allowed by CORS: ${origin}`));
};

export const corsOptions: CorsOptions = {
  origin: corsOrigin,
  credentials: true,
};
