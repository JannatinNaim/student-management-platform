import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { codeForMessage } from "../lib/messages";

/** Optional machine code + interpolation params for client-side translation. */
export interface ApiErrorMeta {
  details?: unknown;
  /** Stable code the client translates; defaults to a lookup of `message`. */
  code?: string;
  /** Interpolation values for the translated template. */
  params?: Record<string, string | number>;
}

export class ApiError extends Error {
  details?: unknown;
  code?: string;
  params?: Record<string, string | number>;

  constructor(public statusCode: number, message: string, meta?: ApiErrorMeta) {
    super(message);
    this.details = meta?.details;
    this.code = meta?.code;
    this.params = meta?.params;
  }

  static badRequest(message: string, meta?: ApiErrorMeta) {
    return new ApiError(400, message, meta);
  }
  static unauthorized(message = "Authentication required", meta?: ApiErrorMeta) {
    return new ApiError(401, message, meta);
  }
  static forbidden(
    message = "You do not have permission to do that",
    meta?: ApiErrorMeta
  ) {
    return new ApiError(403, message, meta);
  }
  static notFound(message = "Resource not found", meta?: ApiErrorMeta) {
    return new ApiError(404, message, meta);
  }
  static conflict(message: string, meta?: ApiErrorMeta) {
    return new ApiError(409, message, meta);
  }
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    code: "ENDPOINT_NOT_FOUND",
    message: "Endpoint not found",
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      // Explicit code wins; otherwise look the static message up.
      code: err.code ?? codeForMessage(err.message),
      params: err.params,
      message: err.message,
      details: err.details,
    });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_FAILED",
      message: "Validation failed",
      details: err.flatten().fieldErrors,
    });
  }
  // Multer file-size errors arrive as generic errors with a code
  if (typeof err === "object" && err && (err as any).code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      code: "FILE_TOO_LARGE",
      params: { mb: env.maxFileSizeMb },
      message: `File too large. Maximum size is ${env.maxFileSizeMb}MB`,
    });
  }
  console.error(err);
  return res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: env.isProd ? "Internal server error" : String((err as Error)?.message ?? err),
  });
}

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);
