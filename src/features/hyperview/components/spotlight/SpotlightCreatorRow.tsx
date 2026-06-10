import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps";
import { Creator } from "../../../../db/schema";
import FollowButton from "../FollowButton";
import CreatorSocialLinks from "../CreatorSocialLinks";

type Props = {
  creator: Creator;
  role: string;
  baseUrl: string;
  isFollowing: boolean;
};

const SpotlightCreatorRow: FC<Props> = ({
  creator,
  role,
  baseUrl,
  isFollowing,
}) => (
  <View style="spotlight-creator-row">
    <View style="spotlight-creator-main">
      <Behavior
        href={`${baseUrl}/hyperview/creators/${creator.id}/tab/books`}
      />
      {creator.coverUrl ? (
        <Image
          source={creator.coverUrl}
          style="spotlight-creator-avatar"
          resize-mode="cover"
        />
      ) : (
        <View style="spotlight-creator-avatar" />
      )}
      <View style="spotlight-creator-text">
        <Text style="spotlight-creator-role">{role}</Text>
        <Text style="spotlight-creator-name">{creator.displayName}</Text>
      </View>
    </View>
    {/* {creator.id ? (
      <FollowButton
        creatorId={creator.id}
        baseUrl={baseUrl}
        isActive={isFollowing}
      />
    ) : null}
    <CreatorSocialLinks
      baseUrl={baseUrl}
      website={creator.website}
      instagram={creator.instagram}
      twitter={creator.twitter}
      facebook={creator.facebook}
    /> */}
  </View>
);

export default SpotlightCreatorRow;

export const spotlightCreatorRowStyles = () => (
  <>
    <Style
      id="spotlight-creator-row"
      borderWidth={1}
      borderColor="#e5e5e5"
      borderRadius={8}
      padding={12}
      marginBottom={16}
      gap={12}
    />
    <Style
      id="spotlight-creator-main"
      flexDirection="row"
      alignItems="center"
      gap={12}
    />
    <Style
      id="spotlight-creator-avatar"
      width={48}
      height={48}
      borderRadius={24}
    />
    <Style id="spotlight-creator-text" flex={1} gap={2} />
    <Style id="spotlight-creator-role" fontSize={12} color="#666666" />
    <Style
      id="spotlight-creator-name"
      fontSize={15}
      fontWeight="600"
      color="#111111"
    />
  </>
);
