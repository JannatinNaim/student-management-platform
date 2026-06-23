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

  // File storage. "local" writes to the filesystem (served from /uploads) and is
  // the default for development. "s3" targets any S3-compatible object store —
  // Cloudflare R2, AWS S3, MinIO, ... — which is what production deployments use
  // since serverless/container filesystems are ephemeral. The driver defaults to
  // "s3" automatically whenever a bucket is configured.
  storage: {
    driver:
      (process.env.STORAGE_DRIVER as "local" | "s3" | undefined) ??
      (process.env.S3_BUCKET ? "s3" : "local"),
    endpoint: process.env.S3_ENDPOINT || undefined, // e.g. https://<acct>.r2.cloudflarestorage.com
    region: process.env.S3_REGION || "auto", // R2 uses "auto"
    bucket: process.env.S3_BUCKET || "",
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    // Public base URL files are served from (R2 public bucket / custom domain /
    // CDN). Required in s3 mode so stored objects resolve to a fetchable URL.
    publicUrl: (process.env.S3_PUBLIC_URL || "").replace(/\/$/, ""),
    // MinIO and some setups need path-style addressing; R2/S3 use virtual-host.
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  },

  smtp: {
    host: process.env.SMTP_HOST || null,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.MAIL_FROM ?? "Smart Notes <no-reply@smartnotes.app>",
  },
};
