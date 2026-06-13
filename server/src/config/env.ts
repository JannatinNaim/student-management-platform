import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  // CLIENT_URL may list several origins, comma-separated, all of which are
  // accepted by CORS (see lib/cors.ts).
  clientUrls: (process.env.CLIENT_URL ?? "http://localhost:3000")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean),

  databaseUrl: required("DATABASE_URL"),

  jwtAccessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-do-not-use-in-prod"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET", "dev-refresh-secret-do-not-use-in-prod"),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7),

  googleClientId: process.env.GOOGLE_CLIENT_ID || null,

  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB ?? 15),

  smtp: {
    host: process.env.SMTP_HOST || null,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.MAIL_FROM ?? "Smart Notes <no-reply@smartnotes.app>",
  },
};
