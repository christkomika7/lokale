import { Section, Text } from "@react-email/components";
import { ReceiptPayload } from "../../type/mailer";
import { Heading } from "./layout/heading";
import { Layout } from "./layout/layout";
import { Subtext } from "./layout/subtext";
import { COLORS } from "../../config/mailer";
import { Divider } from "./layout/divider";

export function ReceiptEmail({
  userName,
  orderId,
  items,
  total,
  currency = "XAF",
}: ReceiptPayload) {
  return (
    <Layout preview={`Reçu de commande #${orderId}`}>
      <Heading>Votre reçu</Heading>
      <Subtext>
        {userName ? `Merci ${userName} !` : "Merci !"} Votre commande{" "}
        <span style={{ fontWeight: "600", color: COLORS.neutral700 }}>
          #{orderId}
        </span>{" "}
        a bien été enregistrée.
      </Subtext>

      <Section
        style={{
          backgroundColor: COLORS.neutral50,
          borderRadius: "10px",
          padding: "16px 20px",
          margin: "0 0 16px",
        }}
      >
        {items.map((item, i) => (
          <Section
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: i < items.length - 1 ? "8px" : "0",
            }}
          >
            <Text
              style={{
                color: COLORS.neutral700,
                fontSize: "13px",
                margin: "0",
                display: "inline",
              }}
            >
              {item.label}
            </Text>
            <Text
              style={{
                color: COLORS.neutral700,
                fontSize: "13px",
                fontWeight: "600",
                margin: "0",
                display: "inline",
              }}
            >
              {item.amount} {currency}
            </Text>
          </Section>
        ))}
      </Section>

      <Divider />

      <Section
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "0 0 24px",
        }}
      >
        <Text
          style={{
            color: COLORS.neutral900,
            fontSize: "16px",
            fontWeight: "700",
            margin: "0",
          }}
        >
          Total
        </Text>
        <Text
          style={{
            color: COLORS.amber600,
            fontSize: "16px",
            fontWeight: "800",
            margin: "0",
          }}
        >
          {total} {currency}
        </Text>
      </Section>
    </Layout>
  );
}
