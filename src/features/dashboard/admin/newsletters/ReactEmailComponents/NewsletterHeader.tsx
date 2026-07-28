/** @jsxImportSource react */

import { Section, Row, Column, Img, Hr } from "@react-email/components";
import { brand, newsletterAssets } from "../constants";

export const NewsletterHeader = () => (
  <Section style={{ padding: "12px 0 0" }}>
    <Row>
      <Column align="center" className="text-center">
        <Img
          src={newsletterAssets.logo}
          alt="Photobookers"
          height={32}
          className="mx-auto mb-4"
        />
        <Hr
          style={{ borderColor: brand.outlineStrong, borderWidth: 2 }}
          className="mt-0 mb-0 border-t-2"
        />
      </Column>
    </Row>
  </Section>
);
