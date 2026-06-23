import { Heading, Section, Text } from "@react-email/components";
import { NotificationPayload } from "../../type/mailer";
import { Layout } from "./layout/layout";
import { Button } from "./layout/button";
import { Subtext } from "./layout/subtext";
import { COLORS } from "../../config/mailer";

export function NotificationEmail({
  title,
  message,
  userName,
  actionUrl,
  actionLabel = "Voir",
}: NotificationPayload) {
  return (
    <Layout preview={title}>
      <Heading>{title}</Heading>
      {userName && (
        <Text
          style={{
            color: COLORS.neutral500,
            fontSize: "14px",
            margin: "0 0 4px",
          }}
        >
          Bonjour {userName},
        </Text>
      )}
      <Subtext>{message}</Subtext>
      {actionUrl && (
        <Section style={{ margin: "0 0 24px" }}>
          <Button href={actionUrl}>{actionLabel}</Button>
        </Section>
      )}
    </Layout>
  );
}
