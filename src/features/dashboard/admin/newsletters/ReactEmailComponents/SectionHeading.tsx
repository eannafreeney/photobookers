/** @jsxImportSource react */

import type { ReactNode } from "react";
import { Section, Row, Column, Text, Hr } from "@react-email/components";
import { brand } from "../constants";
import { Kicker } from "./Kicker";

export const SectionHeading = ({
  kicker,
  children,
}: {
  kicker?: string;
  children: ReactNode;
}) => (
  <Section style={{ margin: "24px 0" }}>
    <Row>
      <Column>
        {kicker && <Kicker>{kicker}</Kicker>}
        <Text
          className="m-0 text-2xl font-medium leading-[1.15] text-center"
          style={{ color: brand.onSurfaceStrong }}
        >
          {children}
        </Text>
        <Hr
          className="mt-3 mb-0 border-t-2 border-black"
          style={{ borderColor: brand.outlineStrong }}
        />
      </Column>
    </Row>
  </Section>
);
