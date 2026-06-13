import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

// Files are stored on the local filesystem only — no external storage service.
// Served back to clients via the static `/uploads` route (see app.ts).
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");

export interface StoredFile {
  url: string;
}

function safeName(original: string): string {
  const ext = path.extname(original).toLowerCase();
  return `${crypto.randomBytes(16).toString("hex")}${ext}`;
}

export async function storeFile(
  buffer: Buffer,
  originalName: string,
  folder: "notes" | "thumbnails" | "avatars" | "covers" | "problems"
): Promise<StoredFile> {
  const dir = path.join(UPLOAD_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  const filename = safeName(originalName);
  await fs.writeFile(path.join(dir, filename), buffer);
  return { url: `/uploads/${folder}/${filename}` };
}

/**
 * Removes a previously stored file. Never throws — a failed cleanup must not
 * block the database deletion that called it. Safely ignores empty/remote
 * URLs that were not produced by storeFile (e.g. placeholder thumbnails).
 */
export async function deleteFile(url: string | null | undefined): Promise<void> {
  if (!url) return;

  try {
    if (!url.startsWith("/uploads/")) return;
    const relative = url.replace(/^\/uploads\//, "");
    const target = path.resolve(UPLOAD_DIR, relative);
    // Guard against path traversal in stored URLs.
    if (!target.startsWith(UPLOAD_DIR + path.sep)) return;
    await fs.unlink(target);
  } catch {
    // Orphaned file is acceptable; surfacing the error would break note deletion.
  }
}

export function fileHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export { UPLOAD_DIR };
