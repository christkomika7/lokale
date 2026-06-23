import { render } from "@react-email/render";
import * as React from "react";
import { OtpEmail } from "./otp";
import { WelcomeEmail } from "./welcome";
import { ResetPasswordEmail } from "./reset-password-email";
import { VerifyEmailTemplate } from "./verify-email";
import { NotificationEmail } from "./notification";
import { ReceiptEmail } from "./receipt";
import { TemplatePayload } from "../../type/mailer";

export async function renderTemplate(
  payload: TemplatePayload,
): Promise<{ html: string; text: string }> {
  if (payload.type === "raw") {
    return {
      html: payload.html ?? "",
      text: payload.text ?? "",
    };
  }

  let element: React.ReactElement;

  switch (payload.type) {
    case "otp":
      element = <OtpEmail {...payload} />;
      break;
    case "welcome":
      element = <WelcomeEmail {...payload} />;
      break;
    case "reset-password":
      element = <ResetPasswordEmail {...payload} />;
      break;
    case "verify-email":
      element = <VerifyEmailTemplate {...payload} />;
      break;
    case "notification":
      element = <NotificationEmail {...payload} />;
      break;
    case "receipt":
      element = <ReceiptEmail {...payload} />;
      break;
    default:
      throw new Error(
        `[mailer] Unknown template type: ${(payload as any).type}`,
      );
  }

  const html = await render(element, { pretty: false });
  const text = await render(element, { plainText: true });

  return { html, text };
}
