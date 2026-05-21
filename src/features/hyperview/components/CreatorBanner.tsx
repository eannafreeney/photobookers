import { FC } from "hono/jsx";
import { Image, Style, Text, View } from "../../../lib/hxml-comps";
import FollowButton from "./FollowButton";

type CreatorCardCreator = {
  id?: string | null;
  displayName: string;
  slug?: string | null;
  coverUrl?: string | null;
  city?: string | null;
  country?: string | null;
  tagline?: string | null;
  status?: string | null;
  website?: string | null;
  instagram?: string | null;
  twitter?: string | null;
};

type Props = {
  creator: CreatorCardCreator | null | undefined;
  baseUrl?: string;
  isFollowing?: boolean;
};

const CreatorBanner: FC<Props> = ({
  creator,
  baseUrl = "",
  isFollowing = false,
}) => {
  if (!creator) return <></>;

  const location = [creator.city, creator.country].filter(Boolean).join(", ");

  return (
    <View style="creator-card">
      {creator.coverUrl && (
        <Image
          source={creator.coverUrl}
          style="creator-cover"
          resize-mode="cover"
        />
      )}
      <View style="creator-body">
        <View style="creator-body-top">
          <View style="creator-body-left">
            <Text style="creator-name">{creator.displayName}</Text>
            {location && <Text style="creator-location">{location}</Text>}
          </View>

          <View style="creator-body-right">
            {/* Follow button */}
            {creator.id && (
              <FollowButton
                creatorId={creator.id}
                baseUrl={baseUrl}
                isActive={isFollowing}
              />
            )}
          </View>
        </View>
        <View style="creator-body-bottom">
          {creator.tagline && (
            <Text style="creator-tagline">{creator.tagline}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default CreatorBanner;

export const creatorBannerStyles = () => (
  <>
    <Style
      id="creator-card"
      flexDirection="column"
      marginBottom={16}
      backgroundColor="#ffffff"
      overflow="hidden"
    />
    <Style id="creator-cover" width="100%" height={300} />
    <Style id="creator-body" padding={12} flexDirection="column" gap={16} />

    <Style
      id="creator-body-top-wrap"
      flexDirection="row"
      justifyContent="space-between"
      gap={4}
    />
    <Style
      id="creator-name"
      fontSize={16}
      fontWeight="700"
      color="#111111"
      marginBottom={4}
    />
    <Style
      id="creator-location"
      fontSize={13}
      color="#666666"
      marginBottom={4}
    />
    <Style
      id="creator-tagline"
      fontSize={13}
      color="#444444"
      lineHeight={18}
      marginBottom={12}
    />
    <Style
      id="follow-btn"
      paddingTop={10}
      paddingBottom={10}
      paddingLeft={20}
      paddingRight={20}
      borderRadius={8}
      backgroundColor="#111111"
      alignItems="center"
    />
    <Style id="follow-label" fontSize={14} fontWeight="600" color="#ffffff" />
  </>
);
