import { COLORS } from "../../config/mailer";
import { VerifyEmailPayload } from "../../type/mailer";
import { Button } from "./layout/button";
import { Divider } from "./layout/divider";
import { Heading } from "./layout/heading";
import { Layout } from "./layout/layout";
import { Subtext } from "./layout/subtext";
import { Section, Text } from "@react-email/components";

export function VerifyEmailTemplate({
  userName,
  verifyUrl,
  expiresInMinutes = 60,
}: VerifyEmailPayload) {
  return (
    <Layout>
      .<Heading>Confirmez votre email</Heading>
      <Subtext>
        {userName ? `Bonjour ${userName},` : "Bonjour,"} cliquez sur le bouton
        ci-dessous pour vérifier votre adresse email. Ce lien est valable{" "}
        <span style={{ fontWeight: "600", color: COLORS.neutral700 }}>
          {expiresInMinutes} minutes
        </span>
        .
      </Subtext>
      <Section style={{ margin: "0 0 24px" }}>
        <Button href={verifyUrl}>Vérifier mon email</Button>
      </Section>
      <Divider />
      <Text style={{ color: COLORS.neutral400, fontSize: "12px", margin: "0" }}>
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
        <br />
        <a
          href={verifyUrl}
          style={{ color: COLORS.amber500, wordBreak: "break-all" }}
        >
          {verifyUrl}
        </a>
      </Text>
    </Layout>
  );
}
