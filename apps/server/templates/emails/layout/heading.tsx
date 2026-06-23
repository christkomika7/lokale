import { COLORS } from "../../../config/mailer";
import { Text } from "@react-email/components";

interface HeadingProps {
  children: React.ReactNode;
}
export function Heading({ children }: HeadingProps) {
  return (
    <Text
      style={{
        color: COLORS.neutral900,
        fontSize: "20px",
        fontWeight: "700",
        letterSpacing: "-0.2px",
        margin: "0 0 8px",
      }}
    >
      {children}
    </Text>
  );
}
