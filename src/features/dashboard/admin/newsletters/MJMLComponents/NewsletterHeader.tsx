/** @jsxImportSource react */

import { MjmlSection, MjmlColumn, MjmlImage, MjmlDivider } from "mjml-react";
import {
  brand,
  newsletterAssets,
  newsletterLogoWidthPx,
  resolveAppBaseUrl,
} from "../constants";

export const NewsletterHeader = () => (
  <MjmlSection backgroundColor={brand.surface} padding="24px 25px 0">
    <MjmlColumn>
      <MjmlImage
        src={newsletterAssets.logo}
        alt="Photobookers"
        href={resolveAppBaseUrl()}
        width={`${newsletterLogoWidthPx}px`}
        align="center"
        padding="0 0 20px"
      />
      <MjmlDivider
        borderWidth="2px"
        borderColor={brand.outlineStrong}
        padding="0"
      />
    </MjmlColumn>
  </MjmlSection>
);
