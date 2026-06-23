import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps";
import { Creator } from "../../../../db/schema";
import FollowButton from "../FollowButton";

export type SpotlightCreatorRowCreator = Pick<
  Creator,
  "id" | "displayName" | "coverUrl"
>;

type Props = {
  creator: SpotlightCreatorRowCreator;
  role: string;
  baseUrl: string;
  isFollowing: boolean;
};

const SpotlightCreatorRow: FC<Props> = ({
  creator,
  role,
  baseUrl,
  isFollowing,
}) => {
  const profileHref = `${baseUrl}/hyperview/creators/${creator.id}/tab/books`;

  return (
    <View style="spotlight-creator-row">
      <Behavior href={profileHref} />
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
      <FollowButton
        creatorId={creator.id}
        baseUrl={baseUrl}
        isActive={isFollowing}
      />
    </View>
  );
};

export default SpotlightCreatorRow;

export const spotlightCreatorRowStyles = () => (
  <>
    <Style
      id="spotlight-creator-row"
      borderWidth={1}
      flexDirection="row"
      alignItems="center"
      borderColor="#e4e0d5"
      borderRadius={0}
      padding={12}
      gap={12}
    />
    <Style
      id="spotlight-creator-avatar"
      width={48}
      height={48}
      borderRadius={24}
      flexShrink={0}
    />
    <Style
      id="spotlight-creator-text"
      flexDirection="column"
      flex={1}
      gap={2}
    />
    <Style id="spotlight-creator-role" fontSize={12} color="#45413a" />
    <Style
      id="spotlight-creator-name"
      fontSize={15}
      fontWeight="600"
      color="#191613"
    />
    <Style
      id="follow-btn"
      paddingTop={10}
      paddingBottom={10}
      paddingLeft={16}
      paddingRight={16}
      borderRadius={0}
      backgroundColor="#191613"
      alignItems="center"
      flexShrink={0}
    />
    <Style id="follow-label" fontSize={14} fontWeight="600" color="#fbfaf7" />
  </>
);
