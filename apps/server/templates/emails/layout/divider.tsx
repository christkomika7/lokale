import { COLORS } from "../../../config/mailer";
import { Hr } from "@react-email/components";

export function Divider() {
  return (
    <Hr
      style={{
        borderColor: COLORS.neutral200,
        margin: "24px 0",
      }}
    />
  );
}
