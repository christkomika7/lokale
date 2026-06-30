import { emailOTP } from "better-auth/plugins";
import {
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_STRATEGY,
  OTP_TTL,
} from "@lokale/config/auth/otp";
import { sendOtpEmail } from "../../lib/mailer";
import { secondsToMinutes } from "date-fns";
import { prisma } from "../../lib/prisma";

export const emailOtpPlugin = emailOTP({
  allowedAttempts: OTP_MAX_ATTEMPTS,
  otpLength: OTP_LENGTH,
  expiresIn: OTP_TTL,
  resendStrategy: OTP_RESEND_STRATEGY,
  async sendVerificationOTP(data) {
    const { email, otp, type } = data;
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { name: true, firstname: true },
    });

    const userName = user?.name ?? "Inconnu";
    if (type === "sign-in") {
      await sendOtpEmail(email, otp, {
        userName,
        expiresInMinutes: secondsToMinutes(OTP_TTL),
      });
    } else if (type === "email-verification") {
      await sendOtpEmail(email, otp, {
        userName,
        expiresInMinutes: secondsToMinutes(OTP_TTL),
      });
    } else {
      await sendOtpEmail(email, otp, {
        userName,
        expiresInMinutes: secondsToMinutes(OTP_TTL),
      });
    }
  },
});
