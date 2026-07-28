/** @jsxImportSource react */

import { Section, Row, Column, Text } from "@react-email/components";
import { brand } from "../constants";

type NewsletterSubjectProps = {
  subject: string;
  weekLabel?: string;
};

export const NewsletterSubject = ({
  subject,
  weekLabel,
}: NewsletterSubjectProps) => (
  <Section className="p-0">
    <Row>
      <Column align="center" className="p-0">
        <Text
          style={{ color: brand.accent }}
          className="mt-0 mb-0 px-[25px] pt-4 pb-2 text-center text-[11px] font-semibold uppercase leading-[1.2] tracking-[0.18em]"
        >
          Photobookers Weekly
        </Text>
        {weekLabel ? (
          <Text
            style={{ color: brand.onSurfaceWeak }}
            className="mt-0 mb-0 px-[25px] pt-0 pb-3 text-center text-[11px] font-semibold uppercase leading-[1.2] tracking-[0.18em]"
          >
            {weekLabel}
          </Text>
        ) : null}
        <Text
          style={{
            color: brand.onSurfaceStrong,
            fontFamily: brand.fontDisplay,
          }}
          className="mt-0 mb-0 px-[25px] pt-0 pb-6 text-center text-[32px] font-medium leading-[1.1]"
        >
          {subject}
        </Text>
      </Column>
    </Row>
  </Section>
);
