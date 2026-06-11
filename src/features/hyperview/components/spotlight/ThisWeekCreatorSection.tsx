import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps";
import { ArtistOfTheWeekWithCreator } from "../../../app/AOTWServices";
import { PublisherOfTheWeekWithCreator } from "../../../app/POTWServices";
import SectionHeader from "../SectionHeader";
import { capitalize } from "../../../../utils";

type Props = {
  spotlight: ArtistOfTheWeekWithCreator | PublisherOfTheWeekWithCreator;
  spotlightHref: string;
};

const ThisWeekCreatorSection: FC<Props> = ({ spotlight, spotlightHref }) => {
  const { creator } = spotlight;
  const role = capitalize(creator.type);
  const title = `${role} of the Week`;
  const image =
    spotlight.instagramImageUrl ?? creator.coverUrl ?? creator.bannerUrl;

  return (
    <View style="spotlight-creator-section">
      <SectionHeader title={title} />
      {image ? (
        <Image source={image} style="spotlight-cover" resize-mode="cover" />
      ) : null}
      <Text style="spotlight-body-text">{creator.displayName}</Text>
      <View style="spotlight-profile-btn">
        <Text style="spotlight-profile-btn-label">View</Text>
        <Behavior href={spotlightHref} />
      </View>
    </View>
  );
};

export default ThisWeekCreatorSection;

export const thisWeekCreatorSectionStyles = () => (
  <>
    <Style
      id="spotlight-creator-section"
      borderBottomWidth={1}
      borderBottomColor="#e4e0d5"
      paddingBottom={16}
      marginBottom={16}
      gap={8}
    />
    <Style
      id="spotlight-cover"
      width="100%"
      height={280}
      borderRadius={0}
      marginBottom={16}
    />
    <Style
      id="spotlight-body-text"
      fontSize={18}
      fontWeight="700"
      color="#191613"
      lineHeight={20}
    />
    <Style
      id="spotlight-profile-btn"
      borderWidth={1}
      borderColor="#191613"
      borderRadius={0}
      padding={12}
      alignItems="center"
    />
    <Style
      id="spotlight-profile-btn-label"
      fontSize={14}
      fontWeight="600"
      color="#191613"
    />
  </>
);
