export const OTP_LENGTH = 6;
export const OTP_TTL = 600; // 10 minutes
export const OTP_RESEND_COOLDOWN = 150; // 2:30 minute
export const OTP_MAX_ATTEMPTS = 5;
export const RESET_PASSWORD_TOKEN_TTL = 1800; // 30 minutes
export const VERIFY_EMAIL_TOKEN_TTL = 86400; // 24 heures
export const OTP_RESEND_STRATEGY: "rotate" | "reuse" = "rotate";
