import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

export interface AccessTokenPayload {
  sub: string;
  // "STUDENT" | "ADMIN" — stored as a plain string (SQLite has no enums)
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.accessTokenTtl,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const token = randomToken(48);
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}

export async function rotateRefreshToken(token: string) {
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!record || record.expiresAt < new Date()) {
    if (record) await prisma.refreshToken.delete({ where: { id: record.id } });
    return null;
  }
  if (record.user.isBlocked) return null;
  await prisma.refreshToken.delete({ where: { id: record.id } });
  const newToken = await issueRefreshToken(record.userId);
  return { user: record.user, refreshToken: newToken };
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken
    .delete({ where: { tokenHash: hashToken(token) } })
    .catch(() => undefined);
}
