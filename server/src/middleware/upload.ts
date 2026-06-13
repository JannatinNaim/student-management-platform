import multer from "multer";
import path from "path";
import { Request } from "express";
import { env } from "../config/env";
import { ApiError } from "./error";

export type FileCategory = "IMAGE" | "PDF" | "DOCUMENT";

interface FileTypeSpec {
  /** Canonical, lowercase extension without the leading dot. */
  ext: string;
  /** Alternative extensions that map to the same spec (e.g. jpeg → jpg). */
  altExts?: string[];
  /** Canonical MIME type we persist regardless of what the browser declared. */
  mime: string;
  category: FileCategory;
  /**
   * Returns true if the buffer's leading bytes match this type. Text-based
   * formats have no reliable signature, so they validate as "not obviously
   * binary" instead.
   */
  verify: (buffer: Buffer) => boolean;
}

// --- Magic-byte signatures -------------------------------------------------

const isPdf = (b: Buffer) => b.subarray(0, 5).toString("latin1") === "%PDF-";

const isPng = (b: Buffer) =>
  b.subarray(0, 8).equals(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  );

const isJpeg = (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

const isWebp = (b: Buffer) =>
  b.subarray(0, 4).toString("latin1") === "RIFF" &&
  b.subarray(8, 12).toString("latin1") === "WEBP";

const isGif = (b: Buffer) => {
  const sig = b.subarray(0, 6).toString("latin1");
  return sig === "GIF87a" || sig === "GIF89a";
};

// docx / pptx / xlsx / odt / odp / ods / epub are all ZIP containers.
const isZip = (b: Buffer) =>
  b[0] === 0x50 &&
  b[1] === 0x4b &&
  (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07);

// Legacy Office (doc / ppt / xls) use the OLE2 compound-file header.
const isOle = (b: Buffer) =>
  b.subarray(0, 8).equals(
    Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
  );

const isRtf = (b: Buffer) => b.subarray(0, 5).toString("latin1") === "{\\rtf";

// Plain text has no signature; reject anything with NUL bytes in the first
// 8 KB, which is a strong indicator of a disguised binary.
const isText = (b: Buffer) => !b.subarray(0, 8192).includes(0x00);

// --- Allowed types ---------------------------------------------------------

const SPECS: FileTypeSpec[] = [
  // Images
  { ext: "png", mime: "image/png", category: "IMAGE", verify: isPng },
  { ext: "jpg", altExts: ["jpeg"], mime: "image/jpeg", category: "IMAGE", verify: isJpeg },
  { ext: "webp", mime: "image/webp", category: "IMAGE", verify: isWebp },
  { ext: "gif", mime: "image/gif", category: "IMAGE", verify: isGif },

  // PDF
  { ext: "pdf", mime: "application/pdf", category: "PDF", verify: isPdf },

  // Word
  { ext: "doc", mime: "application/msword", category: "DOCUMENT", verify: isOle },
  { ext: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", category: "DOCUMENT", verify: isZip },
  // PowerPoint
  { ext: "ppt", mime: "application/vnd.ms-powerpoint", category: "DOCUMENT", verify: isOle },
  { ext: "pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", category: "DOCUMENT", verify: isZip },
  // Excel
  { ext: "xls", mime: "application/vnd.ms-excel", category: "DOCUMENT", verify: isOle },
  { ext: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", category: "DOCUMENT", verify: isZip },
  // OpenDocument
  { ext: "odt", mime: "application/vnd.oasis.opendocument.text", category: "DOCUMENT", verify: isZip },
  { ext: "odp", mime: "application/vnd.oasis.opendocument.presentation", category: "DOCUMENT", verify: isZip },
  { ext: "ods", mime: "application/vnd.oasis.opendocument.spreadsheet", category: "DOCUMENT", verify: isZip },
  // ebook
  { ext: "epub", mime: "application/epub+zip", category: "DOCUMENT", verify: isZip },
  // Plain text
  { ext: "txt", mime: "text/plain", category: "DOCUMENT", verify: isText },
  { ext: "md", altExts: ["markdown"], mime: "text/markdown", category: "DOCUMENT", verify: isText },
  { ext: "csv", mime: "text/csv", category: "DOCUMENT", verify: isText },
  { ext: "rtf", mime: "application/rtf", category: "DOCUMENT", verify: isRtf },
];

function specForExt(ext: string): FileTypeSpec | undefined {
  const e = ext.toLowerCase().replace(/^\./, "");
  return SPECS.find((s) => s.ext === e || s.altExts?.includes(e));
}

/** Human-readable summary of accepted formats, used in error messages. */
export const ALLOWED_LABEL =
  "PDF, images (PNG, JPG, WEBP, GIF), and documents (DOC, DOCX, PPT, PPTX, XLS, XLSX, ODT, ODP, ODS, TXT, MD, CSV, RTF, EPUB)";

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  // Extension is the authoritative gate here — the browser-declared MIME type
  // is unreliable for formats like .md or .docx. Content is verified later via
  // inspectFile() once the full buffer is in memory.
  if (!specForExt(path.extname(file.originalname))) {
    return cb(
      ApiError.badRequest(`Unsupported file type. Allowed: ${ALLOWED_LABEL}`, {
        code: "UNSUPPORTED_FILE_TYPE",
        params: { allowed: ALLOWED_LABEL },
      })
    );
  }
  cb(null, true);
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024, files: 2 },
  fileFilter,
});

/**
 * Validates an uploaded file's content against its declared extension and
 * returns its canonical category + MIME type. Throws ApiError.badRequest when
 * the extension is unsupported or the magic bytes don't match.
 *
 * This is the first line of defence against disguised/malicious uploads; pair
 * with a real AV scanner (e.g. ClamAV) in production.
 */
export function inspectFile(file: Express.Multer.File): {
  category: FileCategory;
  mime: string;
} {
  const spec = specForExt(path.extname(file.originalname));
  if (!spec) {
    throw ApiError.badRequest(`Unsupported file type. Allowed: ${ALLOWED_LABEL}`, {
      code: "UNSUPPORTED_FILE_TYPE",
      params: { allowed: ALLOWED_LABEL },
    });
  }
  if (!spec.verify(file.buffer)) {
    throw ApiError.badRequest(
      "File content does not match its extension — upload rejected"
    );
  }
  return { category: spec.category, mime: spec.mime };
}
