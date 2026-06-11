import { FC } from "hono/jsx";
import { Style, Text, View } from "../../../../lib/hxml-comps";

type Props = {
  title: string;
  subtitle: string;
};

const SpotlightHeader: FC<Props> = ({ title, subtitle }) => (
  <View style="spotlight-header">
    {subtitle ? (
      <Text style="spotlight-header-subtitle">{subtitle.toUpperCase()}</Text>
    ) : null}
    <Text style="spotlight-header-title">{title}</Text>
  </View>
);

export default SpotlightHeader;

export const spotlightHeaderStyles = () => (
  <>
    <Style
      id="spotlight-header"
      alignItems="center"
      paddingBottom={16}
      gap={4}
    />
    <Style
      id="spotlight-header-title"
      fontFamily="Fraunces-SemiBold"
      fontSize={22}
      color="#191613"
      textAlign="center"
    />
    <Style
      id="spotlight-header-subtitle"
      fontSize={11}
      fontWeight="600"
      letterSpacing={1.5}
      color="#a22c29"
      textAlign="center"
    />
  </>
);
