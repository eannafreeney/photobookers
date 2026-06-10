import { FC } from "hono/jsx";
import { Style, Text, View } from "../../../../lib/hxml-comps";

type Props = {
  title: string;
  subtitle: string;
};

const SpotlightHeader: FC<Props> = ({ title, subtitle }) => (
  <View style="spotlight-header">
    <Text style="spotlight-header-title">{title}</Text>
    {subtitle ? (
      <Text style="spotlight-header-subtitle">{subtitle}</Text>
    ) : null}
  </View>
);

export default SpotlightHeader;

export const spotlightHeaderStyles = () => (
  <>
    <Style
      id="spotlight-header"
      alignItems="center"
      paddingBottom={16}
      marginBottom={16}
      borderBottomWidth={1}
      borderBottomColor="#e5e5e5"
      gap={4}
    />
    <Style
      id="spotlight-header-title"
      fontSize={18}
      fontWeight="700"
      color="#111111"
      textAlign="center"
    />
    <Style
      id="spotlight-header-subtitle"
      fontSize={14}
      color="#666666"
      textAlign="center"
    />
  </>
);
