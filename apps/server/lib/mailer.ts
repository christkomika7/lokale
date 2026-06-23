import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { renderTemplate } from "../templates/emails/render";
import {
  EmailAddress,
  SendEmailOptions,
  SendEmailResult,
  SmtpConfig,
} from "../type/mailer";
import { formatAddress, formatAddresses } from "./helpers";

let _transporter: Transporter | null = null;
let _config: SmtpConfig | null = null;

export function initMailer(config: SmtpConfig): void {
  _config = config;
  _transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    debug: config.debug ?? false,
    logger: config.debug ?? false,
  });
}

export async function sendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  if (!_transporter || !_config) {
    throw new Error(
      "[mailer] Transporter not initialized. Call initMailer() first.",
    );
  }

  const { html, text } = await renderTemplate(options.template);

  const from = options.from
    ? formatAddress(options.from)
    : formatAddress(_config.from);

  try {
    const info = await _transporter.sendMail({
      from,
      to: formatAddresses(options.to),
      cc: formatAddresses(options.cc),
      bcc: formatAddresses(options.bcc),
      replyTo: options.replyTo ? formatAddress(options.replyTo) : undefined,
      subject: options.subject,
      html,
      text,
      attachments: options.attachments,
      headers: options.headers,
      priority: options.priority,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mailer] Failed to send email:", message);
    return { success: false, error: message };
  }
}

export async function verifyMailer(): Promise<boolean> {
  if (!_transporter) return false;
  try {
    await _transporter.verify();
    return true;
  } catch {
    return false;
  }
}

export function sendOtpEmail(
  to: EmailAddress,
  otp: string,
  opts?: { userName?: string; expiresInMinutes?: number; subject?: string },
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: opts?.subject ?? "Votre code de vérification — Lokale.",
    template: {
      type: "otp",
      otp,
      userName: opts?.userName,
      expiresInMinutes: opts?.expiresInMinutes,
    },
  });
}

export function sendWelcomeEmail(
  to: EmailAddress,
  userName: string,
  opts?: { actionUrl?: string; subject?: string },
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: opts?.subject ?? `Bienvenue sur Lokale., ${userName} !`,
    template: { type: "welcome", userName, actionUrl: opts?.actionUrl },
  });
}

export function sendResetPasswordEmail(
  to: EmailAddress,
  resetUrl: string,
  opts?: { userName?: string; expiresInMinutes?: number; subject?: string },
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: opts?.subject ?? "Réinitialisez votre mot de passe — Lokale.",
    template: {
      type: "reset-password",
      resetUrl,
      userName: opts?.userName,
      expiresInMinutes: opts?.expiresInMinutes,
    },
  });
}

export function sendVerifyEmail(
  to: EmailAddress,
  verifyUrl: string,
  opts?: { userName?: string; expiresInMinutes?: number; subject?: string },
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: opts?.subject ?? "Confirmez votre adresse email — Lokale.",
    template: {
      type: "verify-email",
      verifyUrl,
      userName: opts?.userName,
      expiresInMinutes: opts?.expiresInMinutes,
    },
  });
}
