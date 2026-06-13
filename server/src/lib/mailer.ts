import nodemailer from "nodemailer";
import { env } from "../config/env";

/** Email language; mirrors the client locales. */
export type MailLocale = "en" | "bn";

const transporter = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    })
  : null;

async function send(to: string, subject: string, html: string) {
  if (!transporter) {
    console.log(`\n[mail -> ${to}] ${subject}\n${html.replace(/<[^>]+>/g, "")}\n`);
    return;
  }
  await transporter.sendMail({ from: env.smtp.from, to, subject, html });
}

const FOOTER_NOTE: Record<MailLocale, string> = {
  en: "If you didn't request this, you can safely ignore this email.",
  bn: "আপনি যদি এটি অনুরোধ না করে থাকেন, তবে এই ইমেইলটি নিরাপদে উপেক্ষা করতে পারেন।",
};

const wrap = (
  locale: MailLocale,
  title: string,
  body: string,
  cta: { href: string; label: string }
) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;border:1px solid #e2e8f0;border-radius:16px">
    <h1 style="color:#2563eb;font-size:20px">Smart Notes</h1>
    <h2 style="font-size:17px">${title}</h2>
    <p style="color:#475569;line-height:1.6">${body}</p>
    <a href="${cta.href}" style="display:inline-block;margin-top:12px;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">${cta.label}</a>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px">${FOOTER_NOTE[locale]}</p>
  </div>`;

/**
 * Bilingual email copy. Every user-facing string the platform mails is
 * translatable between English and Bangla; the recipient's stored `locale`
 * (User.locale) selects the language.
 */
const COPY = {
  verify: {
    en: {
      subject: "Verify your Smart Notes account",
      title: "Confirm your email address",
      body: "Welcome to Smart Notes! Click the button below to verify your email and unlock uploading.",
      cta: "Verify Email",
    },
    bn: {
      subject: "আপনার স্মার্ট নোটস অ্যাকাউন্ট যাচাই করুন",
      title: "আপনার ইমেইল ঠিকানা নিশ্চিত করুন",
      body: "স্মার্ট নোটসে স্বাগতম! আপনার ইমেইল যাচাই করতে এবং আপলোড সুবিধা চালু করতে নিচের বোতামে ক্লিক করুন।",
      cta: "ইমেইল যাচাই করুন",
    },
  },
  reset: {
    en: {
      subject: "Reset your Smart Notes password",
      title: "Reset your password",
      body: "We received a request to reset your password. This link expires in 1 hour.",
      cta: "Reset Password",
    },
    bn: {
      subject: "আপনার স্মার্ট নোটস পাসওয়ার্ড রিসেট করুন",
      title: "আপনার পাসওয়ার্ড রিসেট করুন",
      body: "আমরা আপনার পাসওয়ার্ড রিসেট করার একটি অনুরোধ পেয়েছি। এই লিঙ্কটির মেয়াদ ১ ঘণ্টায় শেষ হবে।",
      cta: "পাসওয়ার্ড রিসেট করুন",
    },
  },
} as const;

function pickLocale(locale?: string): MailLocale {
  return locale === "bn" ? "bn" : "en";
}

export async function sendVerificationEmail(
  to: string,
  token: string,
  locale?: string
) {
  const l = pickLocale(locale);
  const c = COPY.verify[l];
  const href = `${env.clientUrl}/verify-email?token=${token}`;
  await send(to, c.subject, wrap(l, c.title, c.body, { href, label: c.cta }));
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  locale?: string
) {
  const l = pickLocale(locale);
  const c = COPY.reset[l];
  const href = `${env.clientUrl}/reset-password?token=${token}`;
  await send(to, c.subject, wrap(l, c.title, c.body, { href, label: c.cta }));
}
