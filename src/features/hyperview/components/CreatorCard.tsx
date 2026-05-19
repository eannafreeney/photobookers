import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";

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
};

const CreatorCard: FC<Props> = ({
  creator,
  baseUrl = "",
  title,
  showHeader = true,
}) => {
  if (!creator) return <></>;

  const location = [creator.city, creator.country].filter(Boolean).join(", ");
  const hasSocials = creator.website || creator.instagram || creator.twitter;

  return (
    <View style="creator-card">
      {showHeader && (
        <View style="creator-card-header">
          <Behavior
            trigger="press"
            action="push"
            href={`${baseUrl}/hyperview/creators/${creator.id}/tab/books`}
          />
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
      <Behavior
        action="push"
        trigger="press"
        href={`${baseUrl}/hyperview/creators/${creator.id}/tab/books`}
      />
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
              <View style="follow-btn" id={`follow-btn-${creator.id}`}>
                <Text style="follow-label">Follow</Text>
                <Behavior
                  trigger="press"
                  action="replace-inner"
                  verb="post"
                  href={`${baseUrl}/api/creators/${creator.id}/follow`}
                  target={`follow-btn-${creator.id}`}
                />
              </View>
            )}
          </View>
        </View>
        {/* <View style="creator-body-footer">
          {hasSocials && (
            <View style="creator-socials">
              {creator.website && (
                <View style="social-btn">
                  <Text style="social-label">🌐 Website</Text>
                  <Behavior
                    trigger="press"
                    action="deep-link"
                    href={creator.website}
                  />
                </View>
              )}
              {creator.instagram && (
                <View style="social-btn">
                  <Text style="social-label">Instagram</Text>
                  <Behavior
                    trigger="press"
                    action="deep-link"
                    href={`https://instagram.com/${creator.instagram.replace(/^@/, "")}`}
                  />
                </View>
              )}
              {creator.twitter && (
                <View style="social-btn">
                  <Text style="social-label">𝕏 Twitter</Text>
                  <Behavior
                    trigger="press"
                    action="deep-link"
                    href={`https://x.com/${creator.twitter.replace(/^@/, "")}`}
                  />
                </View>
              )}
            </View>
          )}
        </View> */}
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
      backgroundColor="#ffffff"
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
      id="creator-socials"
      flexDirection="row"
      flexWrap="wrap"
      marginBottom={12}
      gap={8}
    />
    <Style
      id="social-btn"
      paddingTop={6}
      paddingBottom={6}
      paddingLeft={12}
      paddingRight={12}
      borderRadius={6}
      borderWidth={1}
      borderColor="#e5e5e5"
    />
    <Style id="social-label" fontSize={13} color="#333333" />
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
    <Style id="creator-card-header-artist" fontSize={13} color="#555555" />
    <Style id="creator-card-header-title" fontSize={12} color="#999999" />
  </>
);
