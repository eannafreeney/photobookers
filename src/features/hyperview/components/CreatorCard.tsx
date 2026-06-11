import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import { creatorSocialStyles } from "./CreatorSocialLinks";
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
};

type Props = {
  creator: CreatorCardCreator | null | undefined;
  baseUrl?: string;
  title?: string | null;
  showHeader?: boolean;
  isFollowing?: boolean;
  profileHref?: string;
};

const CreatorCard: FC<Props> = ({
  creator,
  baseUrl = "",
  title,
  showHeader = true,
  isFollowing = false,
  profileHref,
}) => {
  if (!creator) return <></>;

  const creatorProfileHref =
    profileHref ?? `${baseUrl}/hyperview/creators/${creator.id}/tab/books`;

  const location = [creator.city, formatCountry(creator.country ?? "")]
    .filter(Boolean)
    .join(" ");

  return (
    <View style="creator-card">
      {showHeader && (
        <View style="creator-card-header">
          <Behavior href={creatorProfileHref} />
          <View style="creator-card-header-creator">
            {creator.coverUrl && (
              <Image
                source={creator.coverUrl}
                style="creator-card-header-avatar"
              />
            )}
            {creator.displayName && (
              <Text style="creator-card-header-artist">
                {creator.displayName}
              </Text>
            )}
          </View>
          {title && <Text style="creator-card-header-title">{title}</Text>}
        </View>
      )}
      <Behavior href={creatorProfileHref} />
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
            {creator.id && (
              <FollowButton
                creatorId={creator.id}
                baseUrl={baseUrl}
                isActive={isFollowing}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default CreatorCard;

export const creatorCardStyles = () => (
  <>
    <Style
      id="creator-card"
      flexDirection="column"
      marginBottom={16}
      backgroundColor="#fbfaf7"
      borderWidth={1}
      borderColor="#e4e0d5"
      overflow="hidden"
    />
    <Style id="creator-cover" width="100%" height={300} />
    <Style id="creator-body" padding={12} flexDirection="column" gap={4} />
    <Style
      id="creator-body-top"
      flexDirection="row"
      justifyContent="space-between"
      gap={4}
    />
    <Style id="creator-body-left" width="60%" />
    <Style id="creator-body-right" width="40%" />
    <Style
      id="creator-body-footer"
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
    {creatorSocialStyles()}
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
    <Style
      id="creator-card-header"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={12}
      paddingRight={12}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      height={40}
    />
    <Style
      id="creator-card-header-creator"
      flexDirection="row"
      alignItems="center"
      gap={8}
      flex={1}
    />
    <Style
      id="creator-card-header-avatar"
      width={24}
      height={24}
      borderRadius={12}
      overflow="hidden"
    />
    <Style id="creator-card-header-artist" fontSize={13} color="#45413a" />
    <Style id="creator-card-header-title" fontSize={12} color="#a39d90" />
  </>
);
