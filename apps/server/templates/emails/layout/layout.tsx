import { COLORS, FONT } from "../../../config/mailer";
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface EmailLayoutProps {
  preview?: string;
  children: React.ReactNode;
}

export function Layout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="fr" dir="ltr">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      {preview && <Preview>{preview}</Preview>}
      <Body
        style={{
          backgroundColor: COLORS.neutral100,
          fontFamily: FONT.family,
          margin: "0",
          padding: "0",
        }}
      >
        <Section
          style={{
            padding: "40px 20px",
          }}
        >
          <Container
            style={{
              maxWidth: "520px",
              margin: "0 auto",
              backgroundColor: COLORS.white,
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
            }}
          >
            <Section
              style={{
                backgroundColor: COLORS.amber500,
                padding: "24px 32px",
                textAlign: "center" as const,
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: "22px",
                  fontWeight: "700",
                  letterSpacing: "-0.3px",
                  margin: "0",
                }}
              >
                Lokale.
              </Text>
            </Section>

            <Section style={{ padding: "32px 32px 24px" }}>{children}</Section>

            <Section
              style={{
                backgroundColor: COLORS.neutral50,
                borderTop: `1px solid ${COLORS.neutral200}`,
                padding: "20px 32px",
                textAlign: "center" as const,
              }}
            >
              <Text
                style={{
                  color: COLORS.neutral400,
                  fontSize: "11px",
                  lineHeight: "1.6",
                  margin: "0",
                }}
              >
                Vous recevez cet email car vous avez un compte sur{" "}
                <Link
                  href="https://lokale.cg"
                  style={{ color: COLORS.amber500 }}
                >
                  lokale.cg
                </Link>
                .
                <br />
                Si vous n'êtes pas à l'origine de cette action, ignorez cet
                email.
                <br />© {new Date().getFullYear()} Lokale. — Brazzaville, Congo
              </Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}
