import { Section, Text } from "@react-email/components";
import { COLORS } from "../../config/mailer";
import { Button } from "./layout/button";
import { Layout } from "./layout/layout";
import { ResetPasswordPayload } from "../../type/mailer";
import { Heading } from "./layout/heading";
import { Subtext } from "./layout/subtext";
import { Divider } from "./layout/divider";

export function ResetPasswordEmail({
  userName,
  resetUrl,
  expiresInMinutes = 30,
}: ResetPasswordPayload) {
  return (
    <Layout preview="Réinitialisez votre mot de passe Lokale.">
      <Heading>Réinitialisation du mot de passe</Heading>
      <Subtext>
        {userName ? `Bonjour ${userName},` : "Bonjour,"} vous avez demandé à
        réinitialiser votre mot de passe. Ce lien expire dans{" "}
        <span style={{ fontWeight: "600", color: COLORS.neutral700 }}>
          {expiresInMinutes} minutes
        </span>
        .
      </Subtext>
      <Section style={{ margin: "0 0 24px" }}>
        <Button href={resetUrl}>Réinitialiser mon mot de passe</Button>
      </Section>
      <Divider />
      <Text style={{ color: COLORS.neutral400, fontSize: "12px", margin: "0" }}>
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        Votre mot de passe restera inchangé.
      </Text>
    </Layout>
  );
}
