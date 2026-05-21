import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";

type Props = {
  baseUrl: string;
  website?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  facebook?: string | null;
};

const CreatorSocialLinks = ({
  baseUrl,
  website,
  instagram,
  twitter,
  facebook,
}: Props) => {
  const hasSocials = website || instagram || twitter || facebook;
  if (!hasSocials) return null;

  return (
    <View style="creator-socials">
      {website && (
        <View style="social-btn">
          <Image
            source={`${baseUrl}/icons/social/website.png`}
            style="social-icon"
            resize-mode="contain"
          />
          <Text style="social-label">Website</Text>
          <Behavior trigger="press" action="deep-link" href={website} />
        </View>
      )}
      {instagram && (
        <View style="social-btn">
          <Image
            source={`${baseUrl}/icons/social/instagram.png`}
            style="social-icon"
            resize-mode="contain"
          />
          <Text style="social-label">Instagram</Text>
          <Behavior
            trigger="press"
            action="deep-link"
            href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
          />
        </View>
      )}
      {facebook && (
        <View style="social-btn">
          <Image
            source={`${baseUrl}/icons/social/facebook.png`}
            style="social-icon"
            resize-mode="contain"
          />
          <Text style="social-label">Facebook</Text>
          <Behavior
            trigger="press"
            action="deep-link"
            href={`https://facebook.com/${facebook.replace(/^@/, "")}`}
          />
        </View>
      )}
      {twitter && (
        <View style="social-btn">
          <Image
            source={`${baseUrl}/icons/social/x.png`}
            style="social-icon"
            resize-mode="contain"
          />
          <Text style="social-label">X</Text>
          <Behavior
            trigger="press"
            action="deep-link"
            href={`https://x.com/${twitter.replace(/^@/, "")}`}
          />
        </View>
      )}
    </View>
  );
};

export default CreatorSocialLinks;

export const creatorSocialStyles = () => (
  <>
    <Style
      id="creator-socials"
      flexDirection="row"
      alignItems="stretch"
      marginTop={16}
      gap={8}
      width="100%"
    />
    <Style
      id="social-btn"
      flex={1}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={8}
      paddingRight={8}
      borderRadius={10}
      borderWidth={1}
      borderColor="#e5e5e5"
      gap={6}
    />
    <Style id="social-icon" width={22} height={22} flexShrink={0} />
    <Style
      id="social-label"
      width="100%"
      fontSize={12}
      fontWeight="600"
      color="#111111"
      textAlign="center"
    />
  </>
);
