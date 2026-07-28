/** @jsxImportSource react */

import { Section, Row, Column, Text } from "@react-email/components";

export const NewsletterIntro = ({ introText }: { introText: string }) => (
  <Section>
    <Row>
      <Column>
        <Text className="m-0 pb-6 text-center text-sm leading-[1.65] px-[25px]">
          {introText}
        </Text>
      </Column>
    </Row>
  </Section>
);
