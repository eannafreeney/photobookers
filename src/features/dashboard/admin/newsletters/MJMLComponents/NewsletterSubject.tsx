/** @jsxImportSource react */

import { MjmlSection, MjmlColumn, MjmlText } from "mjml-react";
import { brand } from "../constants";
import { kickerTextProps } from "./kickerTextProps";

export const NewsletterSubject = ({
  subject,
  weekLabel,
}: {
  subject: string;
  weekLabel?: string;
}) => (
  <MjmlSection backgroundColor={brand.surface} padding="0">
    <MjmlColumn padding="0">
      <MjmlText
        {...kickerTextProps}
        color={brand.accent}
        padding="20px 25px 8px"
      >
        Photobookers Weekly
      </MjmlText>
      {weekLabel ? (
        <MjmlText
          {...kickerTextProps}
          color={brand.onSurfaceWeak}
          padding="0 25px 12px"
        >
          {weekLabel}
        </MjmlText>
      ) : null}
      <MjmlText
        align="center"
        fontSize="32px"
        fontWeight={500}
        lineHeight="1.15"
        color={brand.onSurfaceStrong}
        padding="0 25px 20px"
        fontFamily={brand.fontDisplay}
      >
        {subject}
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);
