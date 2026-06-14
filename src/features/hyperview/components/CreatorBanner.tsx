import { FC } from "hono/jsx";
import { Image, Style, Text, View } from "../../../lib/hxml-comps";
import FollowButton from "./FollowButton";
import { formatCountry } from "../../../lib/utils";

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
  bannerUrl?: string | null;
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

  const location = [creator.city, formatCountry(creator.country ?? "")]
    .filter(Boolean)
    .join(", ");

  return (
    <View style="creator-card">
      {(creator.bannerUrl || creator.coverUrl) && (
        <Image
          source={creator.bannerUrl || creator.coverUrl || ""}
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
      backgroundColor="#fbfaf7"
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
      fontFamily="Fraunces-Medium"
      fontSize={17}
      color="#191613"
      marginBottom={4}
    />
    <Style
      id="creator-location"
      fontSize={13}
      color="#45413a"
      marginBottom={4}
    />
    <Style
      id="creator-tagline"
      fontSize={13}
      color="#45413a"
      lineHeight={18}
      marginBottom={12}
    />
    <Style
      id="follow-btn"
      paddingTop={10}
      paddingBottom={10}
      paddingLeft={20}
      paddingRight={20}
      borderRadius={0}
      backgroundColor="#191613"
      alignItems="center"
    />
    <Style id="follow-label" fontSize={14} fontWeight="600" color="#fbfaf7" />
  </>
);
