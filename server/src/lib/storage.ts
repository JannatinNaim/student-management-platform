import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import type { Readable } from "stream";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../config/env";

/**
 * File storage abstraction with two interchangeable backends:
 *
 *   • "local" — writes to the filesystem under ../../uploads and serves files
 *     back via the static `/uploads` route (see app.ts). Default for dev.
 *   • "s3"    — puts objects in any S3-compatible store (Cloudflare R2, AWS S3,
 *     MinIO). Objects are served from a public base URL (env.storage.publicUrl).
 *     Used in production where the runtime filesystem is ephemeral.
 *
 * Callers (routes) only ever see opaque URLs and never touch the backend
 * directly, so switching backends is purely a matter of configuration.
 */

const isS3 = env.storage.driver === "s3";

// Served back to clients via the static `/uploads` route (local backend only).
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");

export type StorageFolder =
  | "notes"
  | "thumbnails"
  | "avatars"
  | "covers"
  | "problems";

export interface StoredFile {
  url: string;
}

// --- S3 client (lazy singleton) -------------------------------------------

let s3Client: S3Client | null = null;
function s3(): S3Client {
  if (!s3Client) {
    if (!env.storage.bucket || !env.storage.publicUrl) {
      throw new Error(
        "S3 storage selected but S3_BUCKET / S3_PUBLIC_URL are not configured"
      );
    }
    s3Client = new S3Client({
      region: env.storage.region,
      endpoint: env.storage.endpoint,
      forcePathStyle: env.storage.forcePathStyle,
      credentials: {
        accessKeyId: env.storage.accessKeyId,
        secretAccessKey: env.storage.secretAccessKey,
      },
    });
  }
  return s3Client;
}

// --- Helpers ---------------------------------------------------------------

function safeName(original: string): string {
  const ext = path.extname(original).toLowerCase();
  return `${crypto.randomBytes(16).toString("hex")}${ext}`;
}

// Minimal extension → MIME map so objects served straight from R2/S3 carry the
// right Content-Type (matters for images rendered inline). Covers every format
// accepted by middleware/upload; anything else falls back to octet-stream.
const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".odt": "application/vnd.oasis.opendocument.text",
  ".odp": "application/vnd.oasis.opendocument.presentation",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".epub": "application/epub+zip",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".csv": "text/csv",
  ".rtf": "application/rtf",
};

function mimeForName(name: string): string {
  return MIME_BY_EXT[path.extname(name).toLowerCase()] ?? "application/octet-stream";
}

/** True for URLs produced by the local backend (relative /uploads paths). */
export function isLocalUrl(url: string): boolean {
  return url.startsWith("/uploads/");
}

/**
 * Resolves a local /uploads URL to an absolute filesystem path, guarding
 * against path traversal. Returns null for non-local or unsafe URLs.
 */
export function localPathForUrl(url: string): string | null {
  if (!isLocalUrl(url)) return null;
  const target = path.resolve(UPLOAD_DIR, url.replace(/^\/uploads\//, ""));
  if (!target.startsWith(UPLOAD_DIR + path.sep)) return null;
  return target;
}

// Derives the object key from a stored s3 URL. Stored URLs are
// `${publicUrl}/${key}`; fall back to the URL pathname if the prefix moved.
function keyForUrl(url: string): string | null {
  const base = env.storage.publicUrl;
  if (base && url.startsWith(base + "/")) return url.slice(base.length + 1);
  try {
    return new URL(url).pathname.replace(/^\//, "") || null;
  } catch {
    return null;
  }
}

// --- Public API ------------------------------------------------------------

export async function storeFile(
  buffer: Buffer,
  originalName: string,
  folder: StorageFolder,
  contentType?: string
): Promise<StoredFile> {
  const filename = safeName(originalName);

  if (isS3) {
    const key = `${folder}/${filename}`;
    await s3().send(
      new PutObjectCommand({
        Bucket: env.storage.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType ?? mimeForName(originalName),
      })
    );
    return { url: `${env.storage.publicUrl}/${key}` };
  }

  const dir = path.join(UPLOAD_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  return { url: `/uploads/${folder}/${filename}` };
}

/**
 * Removes a previously stored file. Never throws — a failed cleanup must not
 * block the database deletion that called it. Safely ignores empty/remote URLs
 * not produced by storeFile (e.g. placeholder thumbnails, Google avatars).
 */
export async function deleteFile(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    if (isLocalUrl(url)) {
      const target = localPathForUrl(url);
      if (target) await fs.unlink(target);
      return;
    }
    // Only delete objects we own (URLs under our public base / bucket).
    if (!isS3) return;
    const key = keyForUrl(url);
    if (!key) return;
    await s3().send(
      new DeleteObjectCommand({ Bucket: env.storage.bucket, Key: key })
    );
  } catch {
    // Orphaned file is acceptable; surfacing the error would break deletion.
  }
}

export interface RemoteObject {
  body: Readable;
  contentType?: string;
  contentLength?: number;
}

/**
 * Fetches an object stored in s3 for streaming (used by the note download
 * route to deliver a friendly filename with access control intact). Returns
 * null if the URL is not a remote object we can fetch.
 */
export async function getRemoteObject(url: string): Promise<RemoteObject | null> {
  if (isLocalUrl(url) || !isS3) return null;
  const key = keyForUrl(url);
  if (!key) return null;
  const res = await s3().send(
    new GetObjectCommand({ Bucket: env.storage.bucket, Key: key })
  );
  return {
    body: res.Body as Readable,
    contentType: res.ContentType,
    contentLength: res.ContentLength,
  };
}

export function fileHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export { UPLOAD_DIR };
