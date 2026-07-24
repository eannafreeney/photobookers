/** @jsxImportSource react */

import { MjmlSection, MjmlColumn, MjmlButton } from "mjml-react";
import { appStoreUrl, brand } from "../constants";

export const NewsletterAppPromo = () => (
  <MjmlSection backgroundColor={brand.surface} padding="0 25px 24px">
    <MjmlColumn>
      <MjmlButton
        href={appStoreUrl}
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
        Download iOS App
      </MjmlButton>
    </MjmlColumn>
  </MjmlSection>
);
