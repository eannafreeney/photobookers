import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import { capitalize } from "../../../utils";

type Props = {
  tag: string;
  href: string;
  coverUrl?: string | null;
};

const GroupCard: FC<Props> = ({ tag, href, coverUrl }) => (
  <View style="group-card">
    <Behavior href={href} />
    {coverUrl ? (
      <Image source={coverUrl} style="group-card-image" resize-mode="cover" />
    ) : (
      <View style="group-card-placeholder" />
    )}
    <View style="group-card-overlay">
      <Text style="group-card-name">{capitalize(tag)}</Text>
    </View>
  </View>
);

export default GroupCard;

export const groupCardStyles = () => (
  <>
    <Style
      id="group-card"
      width={220}
      height={256}
      borderRadius={0}
      overflow="hidden"
      marginRight={12}
    />
    <Style id="group-card-image" width={220} height={256} />
    <Style
      id="group-card-placeholder"
      width={220}
      height={256}
      backgroundColor="#f0ede8"
      borderWidth={2}
      borderColor="#191613"
    />
    <Style
      id="group-card-overlay"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.55)"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={16}
    />
    <Style
      id="group-card-name"
      fontFamily="Fraunces-Medium"
      fontSize={28}
      letterSpacing={2}
      color="#fbfaf7"
      textAlign="center"
    />
  </>
);
