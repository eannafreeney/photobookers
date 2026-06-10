import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps";
import { xmlText } from "../../../../lib/hxml";

type Props = {
  baseUrl: string;
  shareUrl: string;
  shareTitle: string;
  shareMessage: string;
  shareImage?: string | null;
};

const SpotlightShare: FC<Props> = ({
  baseUrl,
  shareUrl,
  shareTitle,
  shareMessage,
  shareImage,
}) => (
  <View style="spotlight-share-row">
    <View style="spotlight-share-block">
      <Image
        source={`${baseUrl}/icons/share.png`}
        style="book-action-icon"
        resize-mode="contain"
      />
      <Text style="book-action-label">Share</Text>
      <Behavior
        action="share"
        href={shareUrl}
        share-url={xmlText(shareUrl)}
        share-message={xmlText(shareMessage)}
        share-title={xmlText(shareTitle)}
        {...(shareImage ? { "share-image": xmlText(shareImage) } : {})}
      />
    </View>
  </View>
);

export default SpotlightShare;

export const spotlightShareStyles = () => (
  <>
    <Style
      id="spotlight-share-row"
      alignItems="center"
      marginTop={8}
      marginBottom={16}
    />
    <Style
      id="spotlight-share-block"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap={8}
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={16}
      paddingRight={16}
      borderRadius={10}
      backgroundColor="#ffffff"
      borderWidth={1}
      borderColor="#e8e8e6"
    />
  </>
);
