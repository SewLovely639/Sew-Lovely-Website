import * as React from "react";
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

export type CustomerOrderConfirmationProps = {
  orderId: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  total: number;
  items: Array<{ qty: number; name: string; price: number }>;
};

const money = (value: number) => `P${value.toFixed(2)}`;

export function CustomerOrderConfirmation({ orderId, customerName, status, paymentStatus, total, items }: CustomerOrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Sew Lovely order {orderId} is confirmed.</Preview>
      <Body style={{ backgroundColor: "#f4eadc", color: "#321225", fontFamily: "Arial, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: 620, margin: "0 auto", padding: "32px 20px" }}>
          <Section style={{ borderTop: "8px solid #ed1687", backgroundColor: "#fffaf2", padding: "24px" }}>
            <Text style={{ color: "#8d123f", letterSpacing: "0.18em", fontSize: 11, textTransform: "uppercase" }}>Sew Lovely</Text>
            <Heading style={{ color: "#321225", fontFamily: "Georgia, serif", fontSize: 30, margin: "12px 0" }}>Thank you, {customerName}.</Heading>
            <Text style={{ fontSize: 16, lineHeight: "24px" }}>We have received your order details and will follow up with the next steps.</Text>
            <Hr style={{ borderColor: "#dccabd", margin: "24px 0" }} />
            <Text><strong>Order:</strong> {orderId}<br /><strong>Status:</strong> {status}<br /><strong>Payment:</strong> {paymentStatus}</Text>
            <Section style={{ backgroundColor: "#f7eee2", padding: "16px", marginTop: 20 }}>
              {items.map((item) => <Text key={`${item.name}-${item.qty}`} style={{ margin: "8px 0" }}>{item.qty} × {item.name} <span style={{ float: "right" }}>{money(item.price * item.qty)}</span></Text>)}
              <Hr style={{ borderColor: "#dccabd" }} />
              <Text style={{ fontWeight: 700, marginBottom: 0 }}>Total <span style={{ float: "right" }}>{money(total)}</span></Text>
            </Section>
            <Text style={{ color: "#8d123f", marginTop: 24 }}>Wear your story. Joy in the details.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default CustomerOrderConfirmation;
