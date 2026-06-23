import { Link } from "@react-email/components";
import { COLORS } from "../../../config/mailer";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
}
export function Button({ href, children }: ButtonProps) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: COLORS.amber500,
        color: COLORS.white,
        fontWeight: "600",
        fontSize: "14px",
        textDecoration: "none",
        borderRadius: "8px",
        padding: "12px 28px",
        letterSpacing: "0.1px",
      }}
    >
      {children}
    </Link>
  );
}
