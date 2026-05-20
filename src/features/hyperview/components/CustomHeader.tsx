import { xmlText } from "../../../lib/hxml-components";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";

type Props = {
  title: string;
  artist?: string | null;
  showBackButton: boolean;
  verified?: boolean;
};

const CustomHeader = ({ title, artist, showBackButton, verified }: Props) => {
  return (
    <View style="custom-header" sticky="true">
      <Behavior trigger="press" action="back" />
      {showBackButton ? <Text style="back-btn">←</Text> : null}
      <View style="header-title-container">
        <Text style={artist ? "header-title-artist" : "header-title"}>
          {xmlText(title)}{" "}
          {verified ? <Text style="verified-badge">✔</Text> : null}
        </Text>
        {artist ? (
          <Text style="header-artist">{`by ${xmlText(artist)}`}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default CustomHeader;

export const customHeaderStyles = () => (
  <>
    <Style
      id="custom-header"
      backgroundColor="#ffffff"
      paddingTop={32}
      paddingBottom={12}
      paddingLeft={16}
      paddingRight={16}
      borderBottomWidth={1}
      borderBottomColor="#e5e5e5"
      flexDirection="row"
      alignItems="center"
    />

    <Style id="header-title-container" flexDirection="column" />
    <Style
      id="header-title"
      fontSize={18}
      fontWeight="700"
      color="#111111"
      flex={1}
    />
    <Style
      id="header-title-artist"
      fontSize={16}
      fontWeight="700"
      color="#111111"
      flex={1}
    />
    <Style id="header-artist" fontSize={12} color="#555555" />
    <Style id="verified-badge" fontSize={10} marginLeft={12} />
    <Style id="back-btn" fontSize={16} color="#3366cc" marginRight={12} />
    <Style
      id="header-cover"
      width={40}
      height={56}
      borderRadius={4}
      borderWidth={1}
      borderColor="#e5e5e5"
      backgroundColor="#f0f0ee"
      marginBottom={8}
    />
  </>
);
