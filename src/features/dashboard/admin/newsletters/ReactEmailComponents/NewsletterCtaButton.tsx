/** @jsxImportSource react */

import { Section, Row, Column, Button } from "@react-email/components";
import { appBaseUrl, brand } from "../constants";

export const NewsletterCtaButton = ({
  ctaText,
  href,
}: {
  ctaText: string;
  href?: string | null;
}) => (
  <Section className="my-12 ">
    <Row>
      <Column align="center">
        <Button
          href={href ?? appBaseUrl}
          style={{ backgroundColor: brand.primary, color: brand.onPrimary }}
          className="text-xs font-semibold tracking-[0.16em] uppercase rounded px-6 py-4 text-center"
        >
          {ctaText}
        </Button>
      </Column>
    </Row>
  </Section>
);
