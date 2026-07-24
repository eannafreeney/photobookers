/** @jsxImportSource react */

import { Section, Row, Column, Button } from "@react-email/components";
import { appStoreUrl } from "../constants";

export const NewsletterAppPromo = () => (
  <Section style={{ padding: "0 0 6px" }}>
    <Row>
      <Column align="center">
        <Button
          href={appStoreUrl}
          style={{ margin: "0 auto" }}
          className="bg-black text-white text-xs font-semibold tracking-[0.16em] uppercase rounded px-6 py-4 text-center"
        >
          Download iOS App
        </Button>
      </Column>
    </Row>
  </Section>
);
