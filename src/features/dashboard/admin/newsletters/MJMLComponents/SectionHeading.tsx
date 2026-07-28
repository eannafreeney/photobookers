/** @jsxImportSource react */

import type { ReactNode } from "react";
import { MjmlSection, MjmlColumn, MjmlText, MjmlDivider } from "mjml-react";
import { brand } from "../constants";
import { kickerTextProps } from "./kickerTextProps";

export const SectionHeading = ({
  kicker,
  children,
}: {
  kicker?: string;
  children: ReactNode;
}) => (
  <MjmlSection backgroundColor={brand.surface} padding="28px 25px 12px">
    <MjmlColumn>
      {kicker ? (
        <MjmlText {...kickerTextProps} color={brand.accent} padding="0 0 6px">
          {kicker}
        </MjmlText>
      ) : null}
      <MjmlText
        align="center"
        fontSize="24px"
        fontWeight={500}
        lineHeight="1.2"
        color={brand.onSurfaceStrong}
        padding="0 0 12px"
        fontFamily={brand.fontDisplay}
      >
        {children}
      </MjmlText>
      <MjmlDivider
        borderWidth="2px"
        borderColor={brand.outlineStrong}
        padding="0"
      />
    </MjmlColumn>
  </MjmlSection>
);
