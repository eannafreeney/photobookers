/** @jsxImportSource react */

import { MjmlSection, MjmlColumn, MjmlText } from "mjml-react";
import { brand } from "../constants";

export const NewsletterIntro = ({ introText }: { introText: string }) => (
  <MjmlSection backgroundColor={brand.surface} padding="0">
    <MjmlColumn>
      <MjmlText
        align="center"
        fontSize="15px"
        lineHeight="1.65"
        color={brand.onSurface}
        padding="0 25px 24px"
      >
        {introText}
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);
