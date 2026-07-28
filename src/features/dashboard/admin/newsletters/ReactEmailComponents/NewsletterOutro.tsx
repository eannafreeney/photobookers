/** @jsxImportSource react */

import { Section, Row, Column, Text } from "@react-email/components";
import { brand } from "../constants";

export const NewsletterOutro = ({ outroText }: { outroText: string }) => (
  <Section style={{ backgroundColor: brand.surface }}>
    <Row>
      <Column>
        <Text
          style={{ color: brand.onSurface }}
          className="m-0 text-center text-sm leading-[1.65] px-[25px]"
        >
          {outroText}
        </Text>
      </Column>
    </Row>
  </Section>
);
