import { Section, Text } from "@react-email/components";
import type { OtpPayload } from "../../type/mailer";
import { Layout } from "./layout/layout";
import { Heading } from "./layout/heading";
import { Subtext } from "./layout/subtext";
import { Divider } from "./layout/divider";
import { COLORS } from "../../config/mailer";

interface OtpEmailProps extends OtpPayload {}

export function OtpEmail({
  otp,
  expiresInMinutes = 10,
  userName,
}: OtpEmailProps) {
  return (
    <Layout preview={`Votre code de vérification : ${otp}`}>
      <Heading>
        {userName ? `Bonjour ${userName} 👋` : "Vérification requise"}
      </Heading>

      <Subtext>
        Utilisez le code ci-dessous pour confirmer votre identité. Il est
        valable pendant{" "}
        <span style={{ fontWeight: "600", color: COLORS.neutral700 }}>
          {expiresInMinutes} minutes
        </span>
        .
      </Subtext>

      <Section
        style={{
          backgroundColor: COLORS.amber50,
          border: `1.5px solid ${COLORS.amber100}`,
          borderRadius: "12px",
          padding: "24px 16px",
          textAlign: "center" as const,
          margin: "0 0 24px",
        }}
      >
        <Text
          style={{
            color: COLORS.amber600,
            fontSize: "40px",
            fontWeight: "800",
            letterSpacing: "12px",
            margin: "0",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {otp}
        </Text>
      </Section>

      <Divider />

      <Text
        style={{
          color: COLORS.neutral400,
          fontSize: "12px",
          lineHeight: "1.6",
          margin: "0",
        }}
      >
        🔒 Ne partagez jamais ce code. Lokale. ne vous demandera jamais votre
        code par téléphone ou email.
        <br />
        Si vous n'avez pas demandé ce code, ignorez cet email.
      </Text>
    </Layout>
  );
}
