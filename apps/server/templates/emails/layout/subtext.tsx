import { COLORS } from "../../../config/mailer";
import { Text } from "@react-email/components";

export function Subtext({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        color: COLORS.neutral500,
        fontSize: "14px",
        lineHeight: "1.6",
        margin: "0 0 24px",
      }}
    >
      {children}
    </Text>
  );
}
