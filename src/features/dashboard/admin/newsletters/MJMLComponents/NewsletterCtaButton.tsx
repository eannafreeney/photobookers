/** @jsxImportSource react */

import { MjmlSection, MjmlColumn, MjmlButton } from "mjml-react";
import { brand, resolveAppBaseUrl } from "../constants";

export const NewsletterCtaButton = ({
  ctaText,
  href,
}: {
  ctaText: string;
  href?: string | null;
}) => (
  <MjmlSection backgroundColor={brand.surface} padding="24px 25px 8px">
    <MjmlColumn>
      <MjmlButton
        href={href || resolveAppBaseUrl()}
        backgroundColor={brand.primary}
        color={brand.onPrimary}
        fontSize="11px"
        fontWeight={600}
        letterSpacing="0.16em"
        textTransform="uppercase"
        borderRadius="4px"
        innerPadding="14px 28px"
        align="center"
      >
        {ctaText}
      </MjmlButton>
    </MjmlColumn>
  </MjmlSection>
);
