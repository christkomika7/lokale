import type { WelcomePayload } from "../../type/mailer";
import { Layout } from "./layout/layout";
import { Heading } from "./layout/heading";
import { Subtext } from "./layout/subtext";
import { Button } from "./layout/button";
import { Divider } from "./layout/divider";
import { COLORS } from "../../config/mailer";
import { Section, Text } from "@react-email/components";

export function WelcomeEmail({ userName, actionUrl }: WelcomePayload) {
  return (
    <Layout preview={`Bienvenue sur Lokale., ${userName} !`}>
      <Heading>Bienvenue, {userName} 🎉</Heading>
      <Subtext>
        Votre compte a été créé avec succès. Découvrez dès maintenant les
        meilleurs restaurants, pharmacies et commerces près de chez vous au
        Congo.
      </Subtext>
      {actionUrl && (
        <Section style={{ margin: "0 0 24px" }}>
          <Button href={actionUrl}>Explorer Lokale.</Button>
        </Section>
      )}
      <Divider />
      <Text style={{ color: COLORS.neutral400, fontSize: "12px", margin: "0" }}>
        Besoin d'aide ? Contactez-nous sur{" "}
        <a href="mailto:support@lokale.cg" style={{ color: COLORS.amber500 }}>
          support@lokale.cg
        </a>
      </Text>
    </Layout>
  );
}
