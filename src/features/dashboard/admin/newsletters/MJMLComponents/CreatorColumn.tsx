/** @jsxImportSource react */

import { MjmlColumn, MjmlImage, MjmlText, MjmlButton } from "mjml-react";
import { appBaseUrl, brand, newsletterThreeColContentWidthPx } from "../constants";
import type { CreatorCardCreator } from "./types";

/** One column in a 3-up creator row (stacks on mobile). */
export const CreatorColumn = ({
  creator,
}: {
  creator: CreatorCardCreator;
}) => {
  const avatarPx = newsletterThreeColContentWidthPx;
  return (
    <MjmlColumn verticalAlign="bottom">
      {creator.coverUrl ? (
        <MjmlImage
          src={creator.coverUrl}
          alt={creator.displayName}
          width={`${avatarPx}px`}
          height={`${avatarPx}px`}
          borderRadius={`${Math.floor(avatarPx / 2)}px`}
          align="center"
          padding="12px 8px 16px"
        />
      ) : null}
      <MjmlText
        align="center"
        fontSize="16px"
        fontWeight={500}
        lineHeight="1.25"
        color={brand.onSurfaceStrong}
        padding="0 8px 12px"
        fontFamily={brand.fontDisplay}
      >
        {creator.displayName}
      </MjmlText>
      <MjmlButton
        href={`${appBaseUrl}/creators/${creator.slug}`}
        backgroundColor="#ffffff"
        color={brand.onSurfaceStrong}
        border={`1px solid ${brand.outlineStrong}`}
        fontSize="11px"
        fontWeight={600}
        letterSpacing="0.12em"
        textTransform="uppercase"
        borderRadius="4px"
        innerPadding="10px 16px"
        align="center"
        padding="0 8px 16px"
      >
        View
      </MjmlButton>
    </MjmlColumn>
  );
};
