import type { Attachment } from "nodemailer/lib/mailer";

export type EmailTemplateType =
  | "otp"
  | "welcome"
  | "reset-password"
  | "verify-email"
  | "notification"
  | "receipt"
  | "raw";

export interface OtpPayload {
  type: "otp";
  otp: string;
  expiresInMinutes?: number;
  userName?: string;
}

export interface WelcomePayload {
  type: "welcome";
  userName: string;
  actionUrl?: string;
}

export interface ResetPasswordPayload {
  type: "reset-password";
  userName?: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export interface VerifyEmailPayload {
  type: "verify-email";
  userName?: string;
  verifyUrl: string;
  expiresInMinutes?: number;
}

export interface NotificationPayload {
  type: "notification";
  title: string;
  message: string;
  userName?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface ReceiptPayload {
  type: "receipt";
  userName?: string;
  orderId: string;
  items: { label: string; amount: string }[];
  total: string;
  currency?: string;
}

export interface RawPayload {
  type: "raw";
  html?: string;
  text?: string;
}

export type TemplatePayload =
  | OtpPayload
  | WelcomePayload
  | ResetPasswordPayload
  | VerifyEmailPayload
  | NotificationPayload
  | ReceiptPayload
  | RawPayload;

export interface EmailRecipient {
  address: string;
  name?: string;
}

export type EmailAddress = string | EmailRecipient;

export interface SendEmailOptions {
  to: EmailAddress | EmailAddress[];
  subject: string;
  template: TemplatePayload;
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  replyTo?: EmailAddress;
  from?: EmailAddress;
  attachments?: Attachment[];
  headers?: Record<string, string>;
  priority?: "high" | "normal" | "low";
  tags?: string[];
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: EmailAddress;
  debug?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
