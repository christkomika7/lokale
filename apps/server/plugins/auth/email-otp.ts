import { emailOTP } from "better-auth/plugins";
import {
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_STRATEGY,
  OTP_TTL,
} from "@lokale/config/auth/otp";
import { sendOtpEmail, sendResetPasswordEmail } from "../../lib/mailer";
import { secondsToMinutes } from "date-fns";
import { prisma } from "../../lib/prisma";
import { logFailure, logSuccess } from "../../lib/logs";

export const emailOtpPlugin = emailOTP({
  allowedAttempts: OTP_MAX_ATTEMPTS,
  otpLength: OTP_LENGTH,
  expiresIn: OTP_TTL,
  resendStrategy: OTP_RESEND_STRATEGY,
  async sendVerificationOTP(data) {
    const { email, otp, type } = data;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, firstname: true },
    });

    const userName = user?.name ?? "Inconnu";

    try {
      if (type === "forget-password") {
        await sendResetPasswordEmail(email, otp, {
          userName,
          expiresInMinutes: secondsToMinutes(OTP_TTL),
        });
      } else {
        await sendOtpEmail(email, otp, {
          userName,
          expiresInMinutes: secondsToMinutes(OTP_TTL),
        });
      }

      await logSuccess({
        action: `auth.otp_sent.${type}`,
        message: `OTP envoyé à ${email}`,
        userEmail: email,
      });
    } catch (error) {
      await logFailure({
        action: `auth.otp_send_failed.${type}`,
        message: `Échec d'envoi de l'OTP à ${email}`,
        userEmail: email,
        error,
      });
      throw error;
    }
  },
});
