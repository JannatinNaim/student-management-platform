import { PrismaClient } from "@prisma/client";

/**
 * SQLite has no array column type, so `Note.tags` and `User.interests` are
 * stored as JSON-encoded strings. These helpers transparently convert them back
 * and forth so the rest of the app keeps working with `string[]` and the API
 * contract is unchanged.
 */
const JSON_ARRAY_FIELDS = new Set(["tags", "interests"]);

function serializeTagsInArgs(args: unknown) {
  if (!args || typeof args !== "object") return;
  for (const key of ["data", "create", "update"] as const) {
    const payload = (args as Record<string, unknown>)[key];
    if (!payload || typeof payload !== "object") continue;
    for (const field of JSON_ARRAY_FIELDS) {
      if (Array.isArray((payload as Record<string, unknown>)[field])) {
        (payload as Record<string, unknown>)[field] = JSON.stringify(
          (payload as Record<string, unknown>)[field]
        );
      }
    }
  }
}

function deserializeTags<T>(value: T): T {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = deserializeTags(value[i]);
    return value;
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const obj = value as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (JSON_ARRAY_FIELDS.has(key) && typeof obj[key] === "string") {
        try {
          obj[key] = JSON.parse(obj[key] as string);
        } catch {
          obj[key] = [];
        }
      } else {
        obj[key] = deserializeTags(obj[key]);
      }
    }
    return value;
  }
  return value;
}

const base = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export const prisma = base.$extends({
  query: {
    async $allOperations({ args, query }) {
      serializeTagsInArgs(args);
      const result = await query(args);
      return deserializeTags(result);
    },
  },
});
