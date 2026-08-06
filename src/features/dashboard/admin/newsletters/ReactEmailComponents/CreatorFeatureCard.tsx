/** @jsxImportSource react */

import { Section, Row, Column } from "@react-email/components";
import { resolveAppBaseUrl } from "../constants";
import { BodyCopy } from "./BodyCopy";
import { RoundedImage } from "./RoundedImage";
import { Title } from "./Title";
import { ViewButton } from "./ViewButton";

type CreatorFeatureCardCreator = {
  displayName: string;
  slug: string;
  type?: "artist" | "publisher";
  coverUrl: string | null;
  tagline?: string | null;
  blurb?: string | null;
};

export const CreatorFeatureCard = ({
  creator,
}: {
  creator: CreatorFeatureCardCreator;
}) => (
  <Section className="mb-12">
    <Row>
      <Column>
        {creator.coverUrl ? (
          <RoundedImage src={creator.coverUrl} alt={creator.displayName} />
        ) : null}
        <Title>{creator.displayName}</Title>
        {creator.blurb ? <BodyCopy>{creator.blurb}</BodyCopy> : null}
        <ViewButton href={`${resolveAppBaseUrl()}/creators/${creator.slug}`} />
      </Column>
    </Row>
  </Section>
);
