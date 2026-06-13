import bcrypt from "bcryptjs";
import { Router, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { env } from "../config/env";
import { sendPasswordResetEmail, sendVerificationEmail } from "../lib/mailer";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { ApiError, asyncHandler } from "../middleware/error";
import { authLimiter } from "../middleware/rateLimit";
import { validate } from "../middleware/validate";
import {
  issueRefreshToken,
  randomToken,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
} from "../utils/tokens";

const router = Router();
const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null;

const REFRESH_COOKIE = "sn_refresh";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/i, "Username can only contain letters, numbers and underscores")
    .transform((value) => value.toLowerCase()),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: passwordSchema,
  // Client's current UI language, so the verification email + future mail match.
  locale: z.enum(["en", "bn"]).optional(),
});

const loginSchema = z.object({
  // Either an email address or a username. Both are stored lowercase, so we
  // normalise the identifier the same way before looking it up.
  identifier: z.string().trim().min(1).transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    path: "/api/auth",
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  });
}

function publicUser(user: {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  institution: string | null;
  location: string | null;
  website: string | null;
  course: string | null;
  gradYear: number | null;
  interests: unknown;
  twitter: string | null;
  github: string | null;
  linkedin: string | null;
  role: string;
  locale: string;
  emailVerified: boolean;
  points: number;
  level: number;
  createdAt: Date;
}) {
  const {
    id, name, username, email, avatarUrl, coverUrl, bio, institution, location, website,
    course, gradYear, interests, twitter, github, linkedin, role, locale, emailVerified, points, level, createdAt,
  } = user;
  return {
    id, name, username, email, avatarUrl, coverUrl, bio, institution, location, website,
    course, gradYear,
    interests: (Array.isArray(interests) ? interests : []) as string[],
    twitter, github, linkedin, role, locale, emailVerified, points, level, createdAt,
  };
}

async function issueSession(res: Response, user: Parameters<typeof publicUser>[0]) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = await issueRefreshToken(user.id);
  setRefreshCookie(res, refreshToken);
  return { accessToken, user: publicUser(user) };
}

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, username, email, password, locale } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true, username: true },
    });
    if (existing) {
      throw ApiError.conflict(
        existing.email === email ? "Email is already registered" : "Username is taken"
      );
    }

    const verifyToken = randomToken();
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        verifyToken,
        locale: locale ?? "en",
      },
    });

    await sendVerificationEmail(email, verifyToken, user.locale);
    const session = await issueSession(res, user);
    res.status(201).json({ success: true, data: session });
  })
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw ApiError.unauthorized("Invalid credentials");
    }
    if (user.isBlocked) throw ApiError.forbidden("Your account has been suspended");
    const session = await issueSession(res, user);
    res.json({ success: true, data: session });
  })
);

router.post(
  "/google",
  authLimiter,
  validate(z.object({ idToken: z.string().min(10) })),
  asyncHandler(async (req, res) => {
    if (!googleClient) throw ApiError.badRequest("Google sign-in is not configured");
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.idToken,
      audience: env.googleClientId!,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) throw ApiError.unauthorized("Invalid Google token");

    const email = payload.email.toLowerCase();
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: payload.sub }, { email }] },
    });

    if (user?.isBlocked) throw ApiError.forbidden("Your account has been suspended");

    if (!user) {
      const base = (payload.name ?? email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .slice(0, 18);
      let username = base;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${base}_${Math.floor(Math.random() * 9999)}`;
      }
      user = await prisma.user.create({
        data: {
          name: payload.name ?? "Student",
          username,
          email,
          googleId: payload.sub,
          avatarUrl: payload.picture,
          emailVerified: true,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub, emailVerified: true },
      });
    }

    const session = await issueSession(res, user);
    res.json({ success: true, data: session });
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw ApiError.unauthorized("No session");
    const rotated = await rotateRefreshToken(token);
    if (!rotated) {
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      throw ApiError.unauthorized("Session expired, please sign in again");
    }
    setRefreshCookie(res, rotated.refreshToken);
    const accessToken = signAccessToken({ sub: rotated.user.id, role: rotated.user.role });
    res.json({ success: true, data: { accessToken, user: publicUser(rotated.user) } });
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) await revokeRefreshToken(token);
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.json({ success: true, code: "SIGNED_OUT", message: "Signed out" });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw ApiError.unauthorized();
    res.json({ success: true, data: publicUser(user) });
  })
);

router.post(
  "/verify-email",
  validate(z.object({ token: z.string().min(10) })),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { verifyToken: req.body.token } });
    if (!user) throw ApiError.badRequest("Invalid or expired verification link");
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null },
    });
    res.json({
      success: true,
      code: "EMAIL_VERIFIED",
      message: "Email verified! You can now upload notes.",
    });
  })
);

router.post(
  "/resend-verification",
  authLimiter,
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw ApiError.unauthorized();
    if (user.emailVerified) throw ApiError.badRequest("Email is already verified");
    const verifyToken = user.verifyToken ?? randomToken();
    if (!user.verifyToken) {
      await prisma.user.update({ where: { id: user.id }, data: { verifyToken } });
    }
    await sendVerificationEmail(user.email, verifyToken, user.locale);
    res.json({ success: true, code: "VERIFICATION_EMAIL_SENT", message: "Verification email sent" });
  })
);

router.post(
  "/forgot-password",
  authLimiter,
  validate(z.object({ email: z.string().email().transform((value) => value.toLowerCase()) })),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (user) {
      const resetToken = randomToken();
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExp: new Date(Date.now() + 60 * 60 * 1000) },
      });
      await sendPasswordResetEmail(user.email, resetToken, user.locale);
    }
    // Always succeed to avoid leaking which emails exist
    res.json({
      success: true,
      code: "RESET_LINK_SENT",
      message: "If that email exists, a reset link has been sent",
    });
  })
);

router.post(
  "/reset-password",
  authLimiter,
  validate(z.object({ token: z.string().min(10), password: passwordSchema })),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { resetToken: req.body.token } });
    if (!user || !user.resetTokenExp || user.resetTokenExp < new Date()) {
      throw ApiError.badRequest("Invalid or expired reset link");
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: await bcrypt.hash(req.body.password, 12),
          resetToken: null,
          resetTokenExp: null,
        },
      }),
      // Sign out every device on password reset
      prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
    ]);
    res.json({ success: true, code: "PASSWORD_UPDATED", message: "Password updated, please sign in" });
  })
);

export default router;
